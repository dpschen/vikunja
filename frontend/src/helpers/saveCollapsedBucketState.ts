import type {IBucket} from '@/modelTypes/IBucket'
import type {IProject} from '@/modelTypes/IProject'
import {useStorage} from '@vueuse/core'

const key = 'collapsedBuckets'

export type CollapsedBuckets = {[id: IBucket['id']]: boolean}
export type CollapsedBucketState = { [id: IProject['id']]: CollapsedBuckets }

export const collapsedBucketState = useStorage<CollapsedBucketState>(key, {})
