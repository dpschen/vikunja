package cmd

import "testing"

func Test_migrationIDFromFlags(t *testing.T) {
	tests := []struct {
		name     string
		nameFlag string
		dateFlag string
		want     string
		wantErr  bool
	}{
		{"name only", "20240114224713", "", "20240114224713", false},
		{"date rfc3339", "", "2024-01-14T22:47:13Z", "20240114224713", false},
		{"date only", "", "2024-01-14", "20240114000000", false},
		{"both", "20250317174522", "2024-01-14", "20250317174522", false},
		{"invalid date", "", "not-a-date", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := migrationIDFromFlags(tt.nameFlag, tt.dateFlag)
			if (err != nil) != tt.wantErr {
				t.Fatalf("migrationIDFromFlags error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Fatalf("got %s want %s", got, tt.want)
			}
		})
	}
}
