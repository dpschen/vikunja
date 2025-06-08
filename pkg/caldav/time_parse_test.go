package caldav

import (
	"testing"
	"time"

	"code.vikunja.io/api/pkg/config"
	ics "github.com/arran4/golang-ical"
)

func Test_caldavTimeToTimestamp_RFC3339(t *testing.T) {
	tests := []struct {
		name     string
		value    string
		expected time.Time
	}{
		{
			name:     "RFC3339",
			value:    "2024-05-01T12:34:56Z",
			expected: time.Date(2024, 5, 1, 12, 34, 56, 0, time.UTC).In(config.GetTimeZone()),
		},
		{
			name:     "RFC3339Nano",
			value:    "2024-05-01T12:34:56.123456789Z",
			expected: time.Date(2024, 5, 1, 12, 34, 56, 123456789, time.UTC).In(config.GetTimeZone()),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := caldavTimeToTimestamp(ics.IANAProperty{BaseProperty: ics.BaseProperty{Value: tt.value, ICalParameters: map[string][]string{}}})
			if !got.Equal(tt.expected) {
				t.Errorf("caldavTimeToTimestamp() = %v, want %v", got, tt.expected)
			}
		})
	}
}
