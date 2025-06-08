package user

import (
	"testing"

	"code.vikunja.io/api/pkg/config"
	"code.vikunja.io/api/pkg/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"xorm.io/builder"
)

func TestUpdateEmail(t *testing.T) {
	t.Run("without mailer", func(t *testing.T) {
		db.LoadAndAssertFixtures(t)
		defer config.MailerEnabled.Set(false)
		config.MailerEnabled.Set(false)
		s := db.NewSession()
		defer s.Close()

		err := UpdateEmail(s, &EmailUpdate{
			User:     &User{ID: 1},
			NewEmail: "changed@example.com",
		})
		require.NoError(t, err)

		db.AssertExists(t, "users", map[string]interface{}{
			"id":     1,
			"email":  "changed@example.com",
			"status": int(StatusActive),
		}, false)

		db.AssertCount(t, "user_tokens", builder.Eq{"user_id": 1}, 0)
	})

	t.Run("with mailer", func(t *testing.T) {
		db.LoadAndAssertFixtures(t)
		defer config.MailerEnabled.Set(false)
		config.MailerEnabled.Set(true)
		s := db.NewSession()
		defer s.Close()

		err := UpdateEmail(s, &EmailUpdate{
			User:     &User{ID: 2},
			NewEmail: "changed2@example.com",
		})
		require.NoError(t, err)

		db.AssertExists(t, "users", map[string]interface{}{
			"id":     2,
			"email":  "changed2@example.com",
			"status": int(StatusEmailConfirmationRequired),
		}, false)

		db.AssertCount(t, "user_tokens", builder.And(builder.Eq{"user_id": 2}, builder.Eq{"kind": TokenEmailConfirm}), 1)
	})
}
