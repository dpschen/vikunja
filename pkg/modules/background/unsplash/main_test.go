package unsplash

import (
	"os"
	"testing"

	"code.vikunja.io/api/pkg/events"
	"code.vikunja.io/api/pkg/files"
	"code.vikunja.io/api/pkg/models"
)

func TestMain(m *testing.M) {
	files.InitTests()
	models.SetupTests()
	events.Fake()
	os.Exit(m.Run())
}
