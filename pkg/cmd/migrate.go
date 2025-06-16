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

package cmd

import (
	"fmt"
	"time"

	"code.vikunja.io/api/pkg/initialize"
	"code.vikunja.io/api/pkg/migration"
	"github.com/spf13/cobra"
)

func init() {
	migrateCmd.AddCommand(migrateListCmd)
	migrationRollbackCmd.Flags().StringVarP(&rollbackUntilFlag, "name", "n", "", "The id of the migration you want to roll back until.")
	migrationRollbackCmd.Flags().StringVarP(&rollbackUntilDateFlag, "date", "d", "", "Roll back migrations until the specified date (RFC3339 or YYYY-MM-DD).")
	migrationRollbackCmd.MarkFlagsMutuallyExclusive("name", "date")
	migrateCmd.AddCommand(migrationRollbackCmd)

	migrateCmd.Flags().StringVarP(&migrateUntilFlag, "name", "n", "", "The id of the migration to run up to.")
	migrateCmd.Flags().StringVarP(&migrateUntilDateFlag, "date", "d", "", "Run migrations up to the specified date (RFC3339 or YYYY-MM-DD).")
	migrateCmd.MarkFlagsMutuallyExclusive("name", "date")
	rootCmd.AddCommand(migrateCmd)
}

// TODO: add args to run migrations up or down, until a certain point etc
// Rollback until
// list -> Essentially just show the table, maybe with an extra column if the migration did run or not
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Run database migrations which didn't already run.",
	PersistentPreRun: func(_ *cobra.Command, _ []string) {
		initialize.LightInit()
	},
	RunE: func(_ *cobra.Command, _ []string) error {
		id, err := migrationIDFromFlags(migrateUntilFlag, migrateUntilDateFlag)
		if err != nil {
			return err
		}
		if id != "" {
			return migration.MigrateTo(id, nil)
		}
		migration.Migrate(nil)
		return nil
	},
}

var migrateListCmd = &cobra.Command{
	Use:   "list",
	Short: "Show a list with all database migrations.",
	Run: func(_ *cobra.Command, _ []string) {
		migration.ListMigrations()
	},
}

var rollbackUntilFlag string
var rollbackUntilDateFlag string
var migrateUntilFlag string
var migrateUntilDateFlag string

var migrationRollbackCmd = &cobra.Command{
	Use:   "rollback",
	Short: "Roll migrations back until a certain point.",
	RunE: func(_ *cobra.Command, _ []string) error {
		id, err := migrationIDFromFlags(rollbackUntilFlag, rollbackUntilDateFlag)
		if err != nil {
			return err
		}
		if id == "" {
			return fmt.Errorf("no migration name or date provided")
		}
		migration.Rollback(id)
		return nil
	},
}

// migrationIDFromFlags returns the migration ID based on either name or date flags.
// If both flags are empty, it returns an empty string and no error.
func migrationIDFromFlags(nameFlag, dateFlag string) (string, error) {
	if nameFlag != "" {
		return nameFlag, nil
	}
	if dateFlag == "" {
		return "", nil
	}

	t, err := parseMigrationDate(dateFlag)
	if err != nil {
		return "", err
	}
	return t, nil
}

// parseMigrationDate parses the date flag and returns the migration ID format.
func parseMigrationDate(dateStr string) (string, error) {
	layouts := []string{
		time.RFC3339,
		"2006-01-02",
		"2006-01-02T15:04",
		"2006-01-02 15:04",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"20060102150405",
	}
	for _, l := range layouts {
		if ts, err := time.Parse(l, dateStr); err == nil {
			return ts.Format("20060102150405"), nil
		}
	}
	return "", fmt.Errorf("invalid date format: %s", dateStr)
}
