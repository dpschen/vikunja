import {Factory} from '../support/factory'
import {faker} from '@faker-js/faker'
import {LINK_SHARE_TYPES} from '@/constants/linkShareTypes'

export class LinkShareFactory extends Factory {
	static table = 'link_shares'

	static factory() {
		const now = new Date()

		return {
			id: '{increment}',
			hash: faker.lorem.word(32),
			project_id: 1,
                       right: 0,
                       sharing_type: LINK_SHARE_TYPES.UNKNOWN,
			shared_by_id: 1,
			created: now.toISOString(),
			updated: now.toISOString(),
		}
	}
}
