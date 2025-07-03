package unsplash

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"code.vikunja.io/api/pkg/db"
	"code.vikunja.io/api/pkg/events"
	"code.vikunja.io/api/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func TestPhotoPingbackListener_Handle(t *testing.T) {
	db.LoadAndAssertFixtures(t)
	s := db.NewSession()
	defer s.Close()

	up := &models.UnsplashPhoto{
		FileID:     1,
		UnsplashID: "abc123",
	}
	err := up.Save(s)
	require.NoError(t, err)
	require.NoError(t, s.Commit())

	var requested string
	oldClient := http.DefaultClient
	http.DefaultClient = &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			requested = req.URL.String()
			return &http.Response{StatusCode: 200, Body: io.NopCloser(bytes.NewReader(nil)), Header: make(http.Header)}, nil
		}),
	}
	defer func() { http.DefaultClient = oldClient }()

	ev := &PhotoPingbackEvent{FileID: up.FileID}
	events.TestListener(t, ev, &photoPingbackListener{})

	assert.Contains(t, requested, up.UnsplashID)
}
