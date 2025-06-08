import AbstractModel from './abstractModel'
import UserModel from './user'

import {RIGHTS, type Right} from '@/constants/rights'
import {LINK_SHARE_TYPES, type LinkShareType} from '@/constants/linkShareTypes'
import type {ILinkShare} from '@/modelTypes/ILinkShare'
import type {IUser} from '@/modelTypes/IUser'

export default class LinkShareModel extends AbstractModel<ILinkShare> implements ILinkShare {
	id = 0
	hash = ''
	right: Right = RIGHTS.READ
	sharedBy: IUser = UserModel
       sharingType: LinkShareType = LINK_SHARE_TYPES.UNKNOWN
	projectId = 0
	name: ''
	password: ''
	created: Date = null
	updated: Date = null

	constructor(data: Partial<ILinkShare>) {
		super()
		this.assignData(data)

		this.sharedBy = new UserModel(this.sharedBy)

		this.created = new Date(this.created)
		this.updated = new Date(this.updated)
	}
}
