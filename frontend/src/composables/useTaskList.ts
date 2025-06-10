import {ref, shallowReactive, watch, computed, type ComputedGetter} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useRouteQuery} from '@vueuse/router'

import TaskCollectionService, {
        type ExpandTaskFilterParam,
        getDefaultTaskFilterParams,
        type TaskFilterParams,
} from '@/services/taskCollection'
import TaskService from '@/services/task'
import TaskModel from '@/models/task'
import type {ITaskPartialWithId} from '@/modelTypes/ITask'
import {useProjectViewStore} from '@/stores/projectViews'
import type {ITask} from '@/modelTypes/ITask'
import {error} from '@/message'
import type {IProject} from '@/modelTypes/IProject'
import {useAuthStore} from '@/stores/auth'
import type {IProjectView} from '@/modelTypes/IProjectView'

export type Order = 'asc' | 'desc' | 'none'

export interface SortBy {
	id?: Order
	index?: Order
	done?: Order
	title?: Order
	priority?: Order
	due_date?: Order
	start_date?: Order
	end_date?: Order
	percent_done?: Order
	created?: Order
	updated?: Order
	done_at?: Order,
}

const SORT_BY_DEFAULT: SortBy = {
	id: 'desc',
}

	// This makes sure an id sort order is always sorted last.
	// When tasks would be sorted first by id and then by whatever else was specified, the id sort takes
	// precedence over everything else, making any other sort columns pretty useless.
	function formatSortOrder(sortBy, params) {
		let hasIdFilter = false
		const sortKeys = Object.keys(sortBy)
		for (const s of sortKeys) {
			if (s === 'id') {
				sortKeys.splice(s, 1)
				hasIdFilter = true
				break
			}
		}
		if (hasIdFilter) {
			sortKeys.push('id')
		}
		params.sort_by = sortKeys
		params.order_by = sortKeys.map(s => sortBy[s])

		return params
	}

/**
 * This mixin provides a base set of methods and properties to get tasks.
 */
export function useTaskList(
       projectIdGetter: ComputedGetter<IProject['id']>,
       projectViewIdGetter: ComputedGetter<IProjectView['id']>,
       sortByDefault: SortBy = SORT_BY_DEFAULT,
       expandGetter: ComputedGetter<ExpandTaskFilterParam> = () => 'subtasks',
) {
	
	const projectId = computed(() => projectIdGetter())
	const projectViewId = computed(() => projectViewIdGetter())
	
	const params = ref<TaskFilterParams>({...getDefaultTaskFilterParams()})
	
	const page = useRouteQuery('page', '1', { transform: Number })

	const sortBy = ref({ ...sortByDefault })
	
	const allParams = computed(() => {
		const loadParams = {...params.value}

		return formatSortOrder(sortBy.value, loadParams)
	})
	
	watch(
		() => allParams.value,
		() => {
			// When parameters change, the page should always be the first
			page.value = 1
		},
	)
	
       const authStore = useAuthStore()
       const projectViewStore = useProjectViewStore()
	
       const getAllTasksParams = computed(() => {
               return [
                       {
                               projectId: projectId.value,
                               viewId: projectViewId.value,
                       },
                       {
                               ...allParams.value,
                               filter_timezone: authStore.settings.timezone,
                               expand: expandGetter(),
                       },
                       page.value,
               ]
       })
       let oldParams = ''

       const taskCollectionService = shallowReactive(new TaskCollectionService())
       const taskService = shallowReactive(new TaskService())
       const loading = computed(() => projectViewStore.isLoading(projectId.value, projectViewId.value) || taskService.loading)
       const totalPages = computed(() => taskCollectionService.totalPages)

       const tasks = ref<ITask[]>([])

       async function loadTasks(resetBeforeLoad: boolean = true) {
               if (resetBeforeLoad) {
                       tasks.value = []
               }
               try {
                       tasks.value = await projectViewStore.loadTasks(
                               projectId.value,
                               projectViewId.value,
                               {
                                       ...allParams.value,
                                       expand: expandGetter(),
                               },
                       )
               } catch (e) {
                       error(e)
               }
               return tasks.value
       }

	const route = useRoute()
	watch(() => route.query, (query) => {
		const { 
			page: pageQueryValue,
			s,
			filter,
		} = query
		if (s !== undefined) {
			params.value.s = s as string
		}
		if (pageQueryValue !== undefined) {
			page.value = Number(pageQueryValue)
		}
		if (filter !== undefined) {
			params.value.filter = filter
		}
	}, { immediate: true })

	const router = useRouter()
	watch(
		() => [page.value, params.value.filter, params.value.s],
		() => {
			router.replace({
				name: route.name,
				params: route.params,
				query: {
					page: page.value,
					filter: params.value.filter || undefined,
					s: params.value.s || undefined,
				},
			})
		},
		{ deep: true },
	)

	// Only listen for query path changes
       watch(() => JSON.stringify(getAllTasksParams.value), (newParams) => {
               if (oldParams === newParams) {
                       return
               }

               loadTasks()
               oldParams = newParams
       }, { immediate: true })

       async function addTask(task: Partial<ITask>) {
               const newTask = await taskService.create(new TaskModel({...task}))
               tasks.value.unshift(newTask)
               return newTask
       }

       async function updateTask(task: ITaskPartialWithId) {
               const updated = await taskService.update(new TaskModel({...task}))
               const idx = tasks.value.findIndex(t => t.id === updated.id)
               if (idx !== -1) {
                       tasks.value[idx] = updated
               }
               return updated
       }

       return {
               tasks,
               loading,
               totalPages,
               currentPage: page,
               loadTasks,
               addTask,
               updateTask,
               params,
               sortByParam: sortBy,
       }
}
