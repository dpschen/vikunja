//  Vikunja is a todo-list application to facilitate your life.
//  Copyright 2018 Vikunja and contributors. All rights reserved.
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

package models

import "code.vikunja.io/web"

// Team holds a team object
type Team struct {
	// The unique, numeric id of this team.
	ID int64 `xorm:"int(11) autoincr not null unique pk" json:"id" param:"team"`
	// The name of this team.
	Name string `xorm:"varchar(250) not null" json:"name" valid:"required,runelength(5|250)" minLength:"5" maxLength:"250"`
	// The team's description.
	Description string `xorm:"varchar(250)" json:"description" valid:"runelength(0|250)" minLength:"0" maxLength:"250"`
	CreatedByID int64  `xorm:"int(11) not null INDEX" json:"-"`

	// The user who created this team.
	CreatedBy User `xorm:"-" json:"createdBy"`
	// An array of all members in this team.
	Members []*TeamUser `xorm:"-" json:"members"`

	// A unix timestamp when this relation was created. You cannot change this value.
	Created int64 `xorm:"created" json:"created"`
	// A unix timestamp when this relation was last updated. You cannot change this value.
	Updated int64 `xorm:"updated" json:"updated"`

	web.CRUDable `xorm:"-" json:"-"`
	web.Rights   `xorm:"-" json:"-"`
}

// TableName makes beautiful table names
func (Team) TableName() string {
	return "teams"
}

// AfterLoad gets the created by user object
func (t *Team) AfterLoad() {
	// Get the owner
	t.CreatedBy, _ = GetUserByID(t.CreatedByID)

	// Get all members
	x.Select("*").
		Table("users").
		Join("INNER", "team_members", "team_members.user_id = users.id").
		Where("team_id = ?", t.ID).
		Find(&t.Members)
}

// TeamMember defines the relationship between a user and a team
type TeamMember struct {
	// The unique, numeric id of this team member relation.
	ID int64 `xorm:"int(11) autoincr not null unique pk" json:"id"`
	// The team id.
	TeamID int64 `xorm:"int(11) not null INDEX" json:"-" param:"team"`
	// The id of the member.
	UserID int64 `xorm:"int(11) not null INDEX" json:"userID" param:"user"`
	// Whether or not the member is an admin of the team. See the docs for more about what a team admin can do
	Admin bool `xorm:"tinyint(1) INDEX" json:"admin"`

	// A unix timestamp when this relation was created. You cannot change this value.
	Created int64 `xorm:"created" json:"created"`

	web.CRUDable `xorm:"-" json:"-"`
	web.Rights   `xorm:"-" json:"-"`
}

// TableName makes beautiful table names
func (TeamMember) TableName() string {
	return "team_members"
}

// TeamUser is the team member type
type TeamUser struct {
	User `xorm:"extends"`
	// Whether or not the member is an admin of the team. See the docs for more about what a team admin can do
	Admin bool `json:"admin"`
}

// GetTeamByID gets a team by its ID
func GetTeamByID(id int64) (team Team, err error) {
	if id < 1 {
		return team, ErrTeamDoesNotExist{id}
	}

	exists, err := x.Where("id = ?", id).Get(&team)
	if err != nil {
		return
	}
	if !exists {
		return team, ErrTeamDoesNotExist{id}
	}

	return
}

// ReadOne implements the CRUD method to get one team
// @Summary Gets one team
// @Description Returns a team by its ID.
// @tags team
// @Accept json
// @Produce json
// @Security JWTKeyAuth
// @Param id path int true "Team ID"
// @Success 200 {object} models.Team "The team"
// @Failure 403 {object} code.vikunja.io/web.HTTPError "The user does not have access to the team"
// @Failure 500 {object} models.Message "Internal error"
// @Router /lists/{id} [get]
func (t *Team) ReadOne() (err error) {
	*t, err = GetTeamByID(t.ID)
	return
}

// ReadAll gets all teams the user is part of
// @Summary Get teams
// @Description Returns all teams the current user is part of.
// @tags team
// @Accept json
// @Produce json
// @Param p query int false "The page number. Used for pagination. If not provided, the first page of results is returned."
// @Param s query string false "Search teams by its name."
// @Security JWTKeyAuth
// @Success 200 {array} models.Team "The teams."
// @Failure 500 {object} models.Message "Internal error"
// @Router /teams [get]
func (t *Team) ReadAll(search string, a web.Auth, page int) (interface{}, error) {
	user, err := getUserWithError(a)
	if err != nil {
		return nil, err
	}

	all := []*Team{}
	err = x.Select("teams.*").
		Table("teams").
		Join("INNER", "team_members", "team_members.team_id = teams.id").
		Where("team_members.user_id = ?", user.ID).
		Limit(getLimitFromPageIndex(page)).
		Where("teams.name LIKE ?", "%"+search+"%").
		Find(&all)

	return all, err
}
