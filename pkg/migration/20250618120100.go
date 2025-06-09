// Vikunja is a to-do list application to facilitate your life.
// Copyright 2018-present Vikunja and contributors. All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public Licensee as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public Licensee for more details.
//
// You should have received a copy of the GNU Affero General Public Licensee
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package migration

import (
	"src.techknowlogick.com/xormigrate"
	"xorm.io/xorm"
)

func removeEmptyDescriptions(tx *xorm.Engine, table, column string) error {
	_, err := tx.Table(table).Where(column + " = '<p></p>'").Update(map[string]interface{}{column: ""})
	return err
}

func init() {
	migrations = append(migrations, &xormigrate.Migration{
		ID:          "20250618120100",
		Description: "Remove empty editor html",
		Migrate: func(tx *xorm.Engine) error {
			for _, table := range []string{"tasks", "labels", "projects", "saved_filters", "teams"} {
				if err := removeEmptyDescriptions(tx, table, "description"); err != nil {
					return err
				}
			}
			return removeEmptyDescriptions(tx, "task_comments", "comment")
		},
		Rollback: func(tx *xorm.Engine) error { return nil },
	})
}
