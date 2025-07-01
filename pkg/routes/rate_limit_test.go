package routes

import (
	"testing"
	"time"

	"code.vikunja.io/api/pkg/config"
	"github.com/stretchr/testify/assert"
)

func TestRateLimitDurationOneMinute(t *testing.T) {
	config.InitDefaultConfig()
	config.RateLimitPeriod.Set("1m")

	assert.Equal(t, time.Minute, getRateLimitPeriod())
}

func TestRateLimitDurationSecondsFallback(t *testing.T) {
	config.InitDefaultConfig()
	config.RateLimitPeriod.Set(60)

	assert.Equal(t, time.Minute, getRateLimitPeriod())
}
