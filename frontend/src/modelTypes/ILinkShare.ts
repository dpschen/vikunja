import type {IAbstract} from './IAbstract'
import type {IUser} from './IUser'
import type {Right} from '@/constants/rights'
import type {LinkShareType} from '@/constants/linkShareTypes'

export interface ILinkShare extends IAbstract {
	id: number
	hash: string
	right: Right
	sharedBy: IUser
       sharingType: LinkShareType
	projectId: number
	name: string
	password: string

	created: Date
	updated: Date
}
