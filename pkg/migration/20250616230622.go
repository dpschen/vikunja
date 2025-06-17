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
	"fmt"
	"strings"

	"code.vikunja.io/api/pkg/utils"
	"src.techknowlogick.com/xormigrate"
	"xorm.io/xorm"
)

type project20250616230622 struct {
	ID  int64  `xorm:"autoincr not null pk"`
	UID string `xorm:"varchar(26) not null unique"`
}

func (project20250616230622) TableName() string { return "projects" }

type team20250616230622 struct {
	ID  int64  `xorm:"autoincr not null pk"`
	UID string `xorm:"varchar(26) not null unique"`
}

func (team20250616230622) TableName() string { return "teams" }

func init() {
	migrations = append(migrations, &xormigrate.Migration{
		ID:          "20250616230622",
		Description: "add uid columns to projects and teams",
		Migrate: func(tx *xorm.Engine) error {
			if err := tx.Sync2(project20250616230622{}, team20250616230622{}); err != nil {
				return err
			}

			sess := tx.NewSession()
			if err := sess.Begin(); err != nil {
				return err
			}

			if err := batchBackfillUID(sess, "projects", func() string { return utils.NewULID() }); err != nil {
				_ = sess.Rollback()
				return err
			}
			if err := batchBackfillUID(sess, "teams", func() string { return utils.NewULID() }); err != nil {
				_ = sess.Rollback()
				return err
			}

			return sess.Commit()
		},
		Rollback: func(tx *xorm.Engine) error {
			if err := dropTableColum(tx, "projects", "uid"); err != nil {
				return err
			}
			return dropTableColum(tx, "teams", "uid")
		},
	})
}

func batchBackfillUID(sess *xorm.Session, table string, generator func() string) error {
	const batchSize = 100
	type row struct {
		ID  int64
		UID string
	}

	rows := []row{}
	if err := sess.Table(table).Where("uid = '' OR uid IS NULL").Find(&rows); err != nil {
		return err
	}

	for i := 0; i < len(rows); i += batchSize {
		end := i + batchSize
		if end > len(rows) {
			end = len(rows)
		}
		batch := rows[i:end]
		cases := "CASE id"
		ids := make([]string, 0, len(batch))
		for _, r := range batch {
			uid := generator()
			cases += fmt.Sprintf(" WHEN %d THEN '%s'", r.ID, uid)
			ids = append(ids, fmt.Sprintf("%d", r.ID))
		}
		cases += " END"
		query := fmt.Sprintf("UPDATE %s SET uid = %s WHERE id IN (%s)", table, cases, strings.Join(ids, ","))
		if _, err := sess.Exec(query); err != nil {
			return err
		}
	}
	return nil
}
