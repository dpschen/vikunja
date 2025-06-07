import {useStorage} from '@vueuse/core'

const LAST_VISITED_KEY = 'lastVisited'

export interface LastVisited {
       name: string
       params: object
       query: object
}

export const lastVisited = useStorage<LastVisited | null>(LAST_VISITED_KEY, null)
