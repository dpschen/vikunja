package caldav

import (
	"testing"
	"time"

	"code.vikunja.io/api/pkg/config"
	"github.com/laurent22/ical-go/ics"
	"github.com/stretchr/testify/assert"
)

func TestCaldavTimeToTimestampWithoutTZID(t *testing.T) {
	config.ServiceTimeZone.Set("Europe/Berlin")
	loc := config.GetTimeZone()
	property := ics.IANAProperty{Value: "20231210T101500"}
	ts := caldavTimeToTimestamp(property)
	assert.Equal(t, loc, ts.Location())
	expected := time.Date(2023, 12, 10, 10, 15, 0, 0, loc)
	assert.Equal(t, expected, ts)
}
