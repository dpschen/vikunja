package utils

import (
	"testing"
	"time"

	"code.vikunja.io/api/pkg/config"
	"github.com/stretchr/testify/assert"
)

func TestNowUsesConfiguredTimezone(t *testing.T) {
	loc, err := time.LoadLocation("Europe/Berlin")
	if err != nil {
		t.Fatal(err)
	}
	config.ServiceTimeZone.Set("Europe/Berlin")
	now := Now()
	assert.Equal(t, loc, now.Location())
}
