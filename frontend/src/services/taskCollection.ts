import AbstractService from '@/services/abstractService'
import TaskModel from '@/models/task'

import type {ITask} from '@/modelTypes/ITask'
import BucketModel from '@/models/bucket'

export type ExpandTaskFilterParam = 'subtasks' | 'buckets' | 'reactions' | null

export interface TaskFilterParams {
	sort_by: ('start_date' | 'end_date' | 'due_date' | 'done' | 'id' | 'position' | 'title')[],
	order_by: ('asc' | 'desc')[],
	filter: string,
	filter_include_nulls: boolean,
	filter_timezone?: string,
	s: string,
	per_page?: number,
	expand?: ExpandTaskFilterParam,
}

export function getDefaultTaskFilterParams(): TaskFilterParams {
	return {
		sort_by: ['position', 'id'],
		order_by: ['asc', 'desc'],
		filter: '',
		filter_include_nulls: false,
		filter_timezone: '',
		s: '',
		expand: 'subtasks',
	}
}

export default class TaskCollectionService extends AbstractService<ITask> {
	constructor() {
		super({
			getAll: '/projects/{projectId}/views/{viewId}/tasks',
			// /projects/{projectId}/tasks when viewId is not provided
		})
	}

	getReplacedRoute(path: string, pathparams: Record<string, unknown>): string {
		if (!pathparams.viewId) {
			return super.getReplacedRoute('/projects/{projectId}/tasks', pathparams)
		}
		return super.getReplacedRoute(path, pathparams)
	}

       modelFactory(data) {
               // The api marks buckets explicitly via the `entry_type` property.
               if (data.entryType === 'bucket') {
                       return new BucketModel(data)
               }
               return new TaskModel(data)
       }
}
