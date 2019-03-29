//  Vikunja is a todo-list application to facilitate your life.
//  Copyright 2019 Vikunja and contributors. All rights reserved.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

package migration

import (
	"github.com/go-xorm/xorm"
	"src.techknowlogick.com/xormigrate"
)

// Used for rollback
type teamMembersMigration20190328074430 struct {
	Updated int64 `xorm:"updated"`
}

func (teamMembersMigration20190328074430) TableName() string {
	return "team_members"
}

func init() {
	migrations = append(migrations, &xormigrate.Migration{
		ID:          "20190328074430",
		Description: "Remove updated from team_members",
		Migrate: func(tx *xorm.Engine) error {
			return dropTableColum(tx, "team_members", "updated")
		},
		Rollback: func(tx *xorm.Engine) error {
			return tx.Sync2(teamMembersMigration20190328074430{})
		},
	})
}
