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

package metrics

import (
	"testing"
	"time"

	"code.vikunja.io/api/pkg/modules/keyvalue"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type dummyAuth struct{ id int64 }

func (d dummyAuth) GetID() int64 { return d.id }

func TestSetUserActive_RemovesStaleEntries(t *testing.T) {
	keyvalue.InitStorage()

	activeUsers.mutex.Lock()
	prev := activeUsers.users
	activeUsers.users = activeUsersMap{
		1: {ID: 1, LastSeen: time.Now().Add(-secondsUntilInactive*time.Second - time.Second)},
	}
	activeUsers.mutex.Unlock()
	defer func() {
		activeUsers.mutex.Lock()
		activeUsers.users = prev
		activeUsers.mutex.Unlock()
	}()

	err := SetUserActive(dummyAuth{id: 2})
	require.NoError(t, err)

	activeUsers.mutex.Lock()
	_, oldExists := activeUsers.users[1]
	_, newExists := activeUsers.users[2]
	activeUsers.mutex.Unlock()

	assert.False(t, oldExists)
	assert.True(t, newExists)

	stored := activeUsersMap{}
	_, err = keyvalue.GetWithValue(activeUsersKey, &stored)
	require.NoError(t, err)
	_, oldExists = stored[1]
	_, newExists = stored[2]
	assert.False(t, oldExists)
	assert.True(t, newExists)
}
func TestSetLinkShareActive_RemovesStaleEntries(t *testing.T) {
	keyvalue.InitStorage()

	activeLinkShares.mutex.Lock()
	prev := activeLinkShares.shares
	activeLinkShares.shares = activeLinkSharesMap{
		1: {ID: 1, LastSeen: time.Now().Add(-secondsUntilInactive*time.Second - time.Second)},
	}
	activeLinkShares.mutex.Unlock()
	defer func() {
		activeLinkShares.mutex.Lock()
		activeLinkShares.shares = prev
		activeLinkShares.mutex.Unlock()
	}()

	err := SetLinkShareActive(dummyAuth{id: 2})
	require.NoError(t, err)

	activeLinkShares.mutex.Lock()
	_, oldExists := activeLinkShares.shares[1]
	_, newExists := activeLinkShares.shares[2]
	activeLinkShares.mutex.Unlock()

	assert.False(t, oldExists)
	assert.True(t, newExists)

	stored := activeLinkSharesMap{}
	_, err = keyvalue.GetWithValue(activeLinkSharesKey, &stored)
	require.NoError(t, err)
	_, oldExists = stored[1]
	_, newExists = stored[2]
	assert.False(t, oldExists)
	assert.True(t, newExists)
}
