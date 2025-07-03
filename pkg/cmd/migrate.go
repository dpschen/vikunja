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
	"code.vikunja.io/api/pkg/initialize"
	"code.vikunja.io/api/pkg/log"
	"code.vikunja.io/api/pkg/migration"
	"github.com/spf13/cobra"
)

func init() {
	migrateCmd.AddCommand(migrateListCmd)

	migrateUpCmd.Flags().StringVarP(&migrateUpNameFlag, "name", "n", "", "The id of the migration you want to run up to.")
	migrateCmd.AddCommand(migrateUpCmd)

	migrateDownCmd.Flags().StringVarP(&migrateDownNameFlag, "name", "n", "", "The id of the migration you want to roll back until.")
	migrateCmd.AddCommand(migrateDownCmd)

	rootCmd.AddCommand(migrateCmd)
}

// TODO: add args to run migrations up or down, until a certain point etc
// Rollback until
// list -> Essentially just show the table, maybe with an extra column if the migration did run or not
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Run database migrations.",
	PersistentPreRun: func(_ *cobra.Command, _ []string) {
		initialize.LightInit()
	},
	Run: func(cmd *cobra.Command, args []string) {
		migrateUpCmd.Run(cmd, args)
	},
}

var migrateListCmd = &cobra.Command{
	Use:   "list",
	Short: "Show a list with all database migrations.",
	Run: func(_ *cobra.Command, _ []string) {
		migration.ListMigrations()
	},
}

var (
	migrateUpNameFlag   string
	migrateDownNameFlag string
)

var migrateUpCmd = &cobra.Command{
	Use:   "up",
	Short: "Run database migrations. Use --name to migrate to a specific migration.",
	Run: func(_ *cobra.Command, _ []string) {
		if migrateUpNameFlag == "" {
			migration.Migrate(nil)
			return
		}

		if err := migration.MigrateTo(migrateUpNameFlag, nil); err != nil {
			log.Critical(err.Error())
		}
	},
}

var migrateDownCmd = &cobra.Command{
	Use:   "down",
	Short: "Roll migrations back. Use --name to specify the migration to roll back until.",
	Run: func(_ *cobra.Command, _ []string) {
		migration.Rollback(migrateDownNameFlag)
	},
}
