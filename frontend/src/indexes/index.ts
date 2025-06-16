import Fuse from 'fuse.js'

export interface withId {
        id: number,
}

interface FuseIndex<T extends withId> {
       items: T[]
       fuse: Fuse<T>
}

const indexes: Record<string, FuseIndex<withId>> = {}
export const createNewIndexer = <T extends withId>(name: string, fieldsToIndex: (keyof T)[]) => {
       if (typeof indexes[name] === 'undefined') {
               indexes[name] = {
                       items: [],
                       fuse: new Fuse<T>([], {
                               keys: fieldsToIndex as string[],
                               threshold: 0.3,
                               ignoreLocation: true,
                       }),
               }
       }

       const index = indexes[name] as FuseIndex<T>

       function add(item: T) {
               index.items.push(item)
               index.fuse.add(item)
       }

       function remove(item: T) {
               const i = index.items.findIndex(v => v.id === item.id)
               if (i !== -1) {
                       index.items.splice(i, 1)
                       index.fuse.remove(doc => doc.id === item.id)
               }
       }

       function update(item: T) {
               const i = index.items.findIndex(v => v.id === item.id)
               if (i !== -1) {
                       index.items[i] = item
               } else {
                       index.items.push(item)
               }
               index.fuse.remove(doc => doc.id === item.id)
               index.fuse.add(item)
       }

	function search(query: string | null) {
		if (query === '' || query === null) {
			return null
		}

		return index.fuse.search(query)
			.map(r => r.item.id)
			.filter((value, idx, self) => self.indexOf(value) === idx)
			|| null
	}

	return {
		add,
		remove,
		update,
		search,
	}
}
