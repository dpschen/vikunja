// Vikunja is a to-do list application to facilitate your life.
// Copyright 2018-present Vikunja and contributors. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package unsplash

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"xorm.io/xorm"

	"code.vikunja.io/api/pkg/config"
	"code.vikunja.io/api/pkg/files"
	"code.vikunja.io/api/pkg/log"
	"code.vikunja.io/api/pkg/models"
	"code.vikunja.io/api/pkg/modules/background"
	"code.vikunja.io/api/pkg/modules/keyvalue"
	"code.vikunja.io/api/pkg/web"
)

const (
	unsplashAPIURL      = `https://api.unsplash.com/`
	unsplashViewBaseURL = `https://views.unsplash.com/v`
	cachePrefix         = `unsplash_photo_`
	// maxCachedEmptyPages defines how many pages of results without a search
	// query are kept in memory before the oldest one is removed.
	maxCachedEmptyPages = 5
)

// shared HTTP client for the whole package. Keeps TLS sessions & sets sane timeouts.
var httpClient = &http.Client{
	Timeout: 10 * time.Second,
	Transport: &http.Transport{
		Proxy:               http.ProxyFromEnvironment,
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,
	},
}

// Provider represents an unsplash image provider
// (empty struct required by background.Provider interface)
type Provider struct{}

// SearchResult is a search result from unsplash's api
type SearchResult struct {
	Total      int      `json:"total"`
	TotalPages int      `json:"total_pages"`
	Results    []*Photo `json:"results"`
}

// Photo represents an unsplash photo as returned by their api
type Photo struct {
	ID          string `json:"id"`
	CreatedAt   string `json:"created_at"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	Color       string `json:"color"`
	Description string `json:"description"`
	BlurHash    string `json:"blur_hash"`
	User        struct {
		Username string `json:"username"`
		Name     string `json:"name"`
	} `json:"user"`
	Urls struct {
		Raw     string `json:"raw"`
		Full    string `json:"full"`
		Regular string `json:"regular"`
		Small   string `json:"small"`
		Thumb   string `json:"thumb"`
	} `json:"urls"`
	Links struct {
		Self             string `json:"self"`
		HTML             string `json:"html"`
		Download         string `json:"download"`
		DownloadLocation string `json:"download_location"`
	} `json:"links"`
}

// We're caching the initial collection to save a few api requests as this is retrieved every time a
// user opens the settings page.
// The struct is protected by a RWMutex because the search endpoint is hit concurrently by many users.
type initialCollection struct {
	lastCached time.Time
	images     map[int64][]*background.Image
	mu         sync.RWMutex
}

var emptySearchResult *initialCollection

// doGet performs a GET request against the Unsplash API and automatically unmarshals JSON responses.
// It reuses a shared http.Client for connection reuse and sets the Authorization header.
func doGet(path string, result ...interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, unsplashAPIURL+path, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Client-ID "+config.BackgroundsUnsplashAccessToken.GetString())
	req.Header.Set("Accept-Version", "v1")
	req.Header.Set("User-Agent", "Vikunja/unsplash-module (+https://vikunja.io)")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusBadRequest {
		b := new(bytes.Buffer)
		_, _ = b.ReadFrom(resp.Body)
		return fmt.Errorf("unsplash request failed: status %d – %s", resp.StatusCode, b.String())
	}

	if len(result) > 0 {
		return json.NewDecoder(resp.Body).Decode(result[0])
	}

	return nil
}

func getImageID(fullURL string) string {
	// Unsplash image urls have the form
	// https://images.unsplash.com/photo-1590622878565-c662a7fd1394?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjcyODAwfQ
	// We only need the "photo-*" part of it.
	return strings.Replace(strings.Split(fullURL, "?")[0], "https://images.unsplash.com/", "", 1)
}

// cleanupInitialCache removes cached pages when they exceed the configured
// lifetime or number of pages. The cleanup happens before new entries are added to ensure the cache stays within limits.
func cleanupInitialCache(page int64) {
	if emptySearchResult == nil {
		return
	}

	emptySearchResult.mu.Lock()
	defer emptySearchResult.mu.Unlock()

	// Drop all cached pages if they're older than one hour
	if time.Since(emptySearchResult.lastCached) >= time.Hour {
		emptySearchResult.images = make(map[int64][]*background.Image)
		return
	}

	// Ensure we don't keep more than the allowed number of pages in memory
	if len(emptySearchResult.images) < maxCachedEmptyPages {
		return
	}

	if _, exists := emptySearchResult.images[page]; exists {
		return
	}

	var oldestPage int64
	var set bool
	for p := range emptySearchResult.images {
		if !set || p < oldestPage {
			oldestPage = p
			set = true
		}
	}

	if set {
		delete(emptySearchResult.images, oldestPage)
	}
}

// getUnsplashPhotoInfoByID returns an Unsplash photo either from cache or directly from the Unsplash API.
func getUnsplashPhotoInfoByID(photoID string) (*Photo, error) {
	p := &Photo{}
	exists, err := keyvalue.GetWithValue(cachePrefix+photoID, p)
	if err != nil {
		return nil, err
	}

	if !exists {
		log.Debugf("Image information for Unsplash photo %s not cached, requesting from Unsplash...", photoID)
		if err := doGet("photos/"+photoID, p); err != nil {
			return nil, err
		}
		_ = keyvalue.Put(cachePrefix+photoID, p) // cache errors are non-fatal
	}
	return p, nil
}

// Search queries Unsplash for backgrounds.
func (p *Provider) Search(_ *xorm.Session, search string, page int64) ([]*background.Image, error) {
	// If we don't have a search query, return results from the Unsplash featured collection
	if search == "" {
		cleanupInitialCache(page)

		if emptySearchResult != nil && time.Since(emptySearchResult.lastCached) < time.Hour {
			emptySearchResult.mu.RLock()
			imgs, existsForPage := emptySearchResult.images[page]
			emptySearchResult.mu.RUnlock()
			if existsForPage {
				log.Debugf("Serving initial wallpaper topic from Unsplash for page %d from cache, last updated at %v", page, emptySearchResult.lastCached)
				return imgs, nil
			}
		}

		log.Debugf("Retrieving initial wallpaper topic from Unsplash for page %d from Unsplash API", page)

		collectionResult := []*Photo{}
		if err := doGet("topics/wallpapers/photos?page="+strconv.FormatInt(page, 10)+"&per_page=25&order_by=latest", &collectionResult); err != nil {
			return nil, err
		}

		result := make([]*background.Image, 0, len(collectionResult))
		for _, p := range collectionResult {
			img := &background.Image{
				ID:       p.ID,
				URL:      getImageID(p.Urls.Raw),
				BlurHash: p.BlurHash,
				Info: &models.UnsplashPhoto{
					UnsplashID: p.ID,
					Author:     p.User.Username,
					AuthorName: p.User.Name,
				},
			}
			result = append(result, img)
			_ = keyvalue.Put(cachePrefix+p.ID, p) // cache errors are non‑fatal
		}

		// cache the collection
		if emptySearchResult == nil {
			emptySearchResult = &initialCollection{
				images: make(map[int64][]*background.Image),
			}
		}
		emptySearchResult.mu.Lock()
		emptySearchResult.images[page] = result
		emptySearchResult.lastCached = time.Now()
		emptySearchResult.mu.Unlock()

		return result, nil
	}

	searchResult := &SearchResult{}
	if err := doGet("search/photos?query="+url.QueryEscape(strings.TrimSpace(search))+"&page="+strconv.FormatInt(page, 10)+"&per_page=25", searchResult); err != nil {
		return nil, err
	}

	result := make([]*background.Image, 0, len(searchResult.Results))
	for _, p := range searchResult.Results {
		img := &background.Image{
			ID:       p.ID,
			URL:      getImageID(p.Urls.Raw),
			BlurHash: p.BlurHash,
			Info: &models.UnsplashPhoto{
				UnsplashID: p.ID,
				Author:     p.User.Username,
				AuthorName: p.User.Name,
			},
		}
		result = append(result, img)
		_ = keyvalue.Put(cachePrefix+p.ID, p)
	}

	return result, nil
}

// Set sets an Unsplash photo as project background.
func (p *Provider) Set(s *xorm.Session, image *background.Image, project *models.Project, auth web.Auth) error {
	// Find the photo
	photo, err := getUnsplashPhotoInfoByID(image.ID)
	if err != nil {
		return err
	}

	// Download the photo from Unsplash – crop to a max height of 2048px to save bandwidth and storage.
	dlURL := photo.Urls.Raw + "&fm=jpg&h=" + strconv.FormatInt(background.MaxBackgroundImageHeight, 10) + "&q=80"
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, dlURL, nil)
	if err != nil {
		return err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		b := new(bytes.Buffer)
		_, _ = b.ReadFrom(resp.Body)
		return fmt.Errorf("error getting Unsplash photo %s: status %d – %s", photo.ID, resp.StatusCode, b.String())
	}

	log.Debug("Downloaded Unsplash photo", "id", image.ID)

	// Ping the Unsplash download endpoint (API requirement)
	if err := doGet(strings.TrimPrefix(photo.Links.DownloadLocation, unsplashAPIURL)); err != nil {
		log.Errorf("Unsplash download ping failed for %s: %v", image.ID, err)
	}

	// Save it as a file in Vikunja
	file, err := files.Create(resp.Body, "", 0, auth)
	if err != nil {
		return err
	}

	// Remove the old background if one exists
	if project.BackgroundFileID != 0 {
		oldFile := files.File{ID: project.BackgroundFileID}
		if err := oldFile.Delete(s); err != nil && !files.IsErrFileDoesNotExist(err) {
			return err
		}
		if err := models.RemoveUnsplashPhoto(s, project.BackgroundFileID); err != nil && !files.IsErrFileDoesNotExist(err) {
			return err
		}
	}

	// Save the relation that we got it from Unsplash
	unsplashPhoto := &models.UnsplashPhoto{
		FileID:     file.ID,
		UnsplashID: image.ID,
		Author:     photo.User.Username,
		AuthorName: photo.User.Name,
	}
	if err := unsplashPhoto.Save(s); err != nil {
		return err
	}
	log.Debug("Saved Unsplash photo", "unsplash_id", image.ID, "file_id", file.ID, "relation_id", unsplashPhoto.ID)

	// Set the file in the project & set blurhash
	project.BackgroundFileID = file.ID
	project.BackgroundInformation = unsplashPhoto

	return models.SetProjectBackground(s, project.ID, file, photo.BlurHash)
}

// Pingback pings the Unsplash API when a locally stored Unsplash photo is viewed.
// It is designed to be called from a goroutine (fire‑and‑forget) to keep user‑perceived latency low.
func Pingback(s *xorm.Session, f *files.File) {
	unsplashPhoto, err := models.GetUnsplashPhotoByFileID(s, f.ID)
	if err != nil {
		if files.IsErrFileIsNotUnsplashFile(err) {
			return
		}
		log.Errorf("Unsplash Pingback: %s", err.Error())
		return
	}

	go pingbackByPhotoID(unsplashPhoto.UnsplashID)
}

func pingbackByPhotoID(photoID string) {
	if photoID == "" {
		return
	}

	// form the URL with proper escaping
	v := url.Values{}
	v.Set("app_id", config.BackgroundsUnsplashApplicationID.GetString())
	v.Set("photo_id", photoID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, unsplashViewBaseURL+"?"+v.Encode(), nil)
	if err != nil {
		log.Errorf("Unsplash Pingback failed to build request: %s", err.Error())
		return
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		log.Errorf("Unsplash Pingback failed: %s", err.Error())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusBadRequest {
		b := new(bytes.Buffer)
		_, _ = b.ReadFrom(resp.Body)
		log.Errorf("Unsplash Pingback failed: status %d – %s", resp.StatusCode, b.String())
		return
	}

	log.Debug("Pinged Unsplash", "photo_id", photoID)
}
