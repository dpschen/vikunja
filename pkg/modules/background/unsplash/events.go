package unsplash

// PhotoPingbackEvent represents an event triggered when a photo should be pinged back to Unsplash.
type PhotoPingbackEvent struct {
	FileID int64 `json:"file_id"`
}

// Name returns the event name.
func (p *PhotoPingbackEvent) Name() string {
	return "background.unsplash.pingback"
}
