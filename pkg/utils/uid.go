// Vikunja is a to-do list application to facilitate your life.
// Copyright 2018-present Vikunja and contributors. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public Licensee as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public Licensee for more details.
//
// You should have received a copy of the GNU Affero General Public Licensee
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package utils

import (
	"crypto/rand"
	"io"
	"sync"
	"time"

	"github.com/oklog/ulid"
)

var (
	ulidEntropy io.Reader
	ulidMutex   sync.Mutex
)

func init() {
	// Use a cryptographically secure source for ULID entropy to avoid predictable identifiers.
	// The monotonic reader ensures IDs remain sortable but may still collide
	// when multiple application instances generate IDs at the exact same
	// millisecond. The chance is small, but uniqueness is enforced by the
	// database constraints.
	ulidEntropy = ulid.Monotonic(rand.Reader, 0)
}

// NewULID returns a new lexicographically sortable identifier.
func NewULID() string {
	ulidMutex.Lock()
	defer ulidMutex.Unlock()

	timestamp := ulid.Timestamp(time.Now().UTC())
	id, err := ulid.New(timestamp, ulidEntropy)
	if err != nil {
		// Fallback to a non-monotonic ULID with crypto randomness on error.
		id = ulid.MustNew(timestamp, rand.Reader)
	}
	return id.String()
}
