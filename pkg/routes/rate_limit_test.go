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

package routes

import (
	"testing"
	"time"

	"github.com/ulule/limiter/v3"

	"code.vikunja.io/api/pkg/config"
)

func TestRateLimitPeriodDuration(t *testing.T) {
	config.InitDefaultConfig()
	config.RateLimitPeriod.Set("1m")
	config.RateLimitStore.Set("memory")

	rate := limiter.Rate{
		Period: config.RateLimitPeriod.GetDuration(),
		Limit:  config.RateLimitLimit.GetInt64(),
	}

	l := createRateLimiter(rate)
	if l.Rate.Period != time.Minute {
		t.Fatalf("expected period 1m, got %v", l.Rate.Period)
	}
}
