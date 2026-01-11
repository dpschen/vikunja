package unsplash

import (
	"encoding/json"

	"code.vikunja.io/api/pkg/db"
	"code.vikunja.io/api/pkg/events"
	"code.vikunja.io/api/pkg/files"
	"github.com/ThreeDotsLabs/watermill/message"
)

// RegisterListeners registers listeners for the unsplash background module.
func RegisterListeners() {
	events.RegisterListener((&PhotoPingbackEvent{}).Name(), &photoPingbackListener{})
}

type photoPingbackListener struct{}

func (l *photoPingbackListener) Name() string { return "photo.pingback" }

func (l *photoPingbackListener) Handle(msg *message.Message) error {
	event := &PhotoPingbackEvent{}
	if err := json.Unmarshal(msg.Payload, event); err != nil {
		return err
	}

	s := db.NewSession()
	defer s.Close()

	f := &files.File{ID: event.FileID}
	if err := f.LoadFileByID(); err != nil {
		return err
	}

	Pingback(s, f)
	return s.Commit()
}
