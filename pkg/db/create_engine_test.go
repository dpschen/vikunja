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

package db

import (
	"os"
	"sync"
	"testing"

	"code.vikunja.io/api/pkg/config"
	"xorm.io/xorm"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateDBEngineConcurrent(t *testing.T) {
	config.InitDefaultConfig()
	config.ServiceRootpath.Set(os.Getenv("VIKUNJA_SERVICE_ROOTPATH"))
	config.DatabasePath.Set("memory")

	x = nil
	engineOnce = sync.Once{}

	const routines = 10
	var wg sync.WaitGroup
	engines := make([]*xorm.Engine, routines)
	errs := make([]error, routines)

	for i := 0; i < routines; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			engines[i], errs[i] = CreateDBEngine()
		}(i)
	}
	wg.Wait()

	for i := 0; i < routines; i++ {
		require.NoError(t, errs[i])
		assert.Equal(t, engines[0], engines[i])
	}
}
