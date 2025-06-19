import type {Ref} from 'vue'
import type {RouteLocationNormalized, RouteLocationRaw} from 'vue-router'

import {isoToKebabDate} from '@/helpers/time/isoToKebabDate'
import {parseDateProp} from '@/helpers/time/parseDateProp'
import {object, coerce, preprocess, string, boolean} from 'zod'
import {useRouteFilters} from '@/composables/useRouteFilters'
import {useGanttTaskList} from './useGanttTaskList'

import type {IProject} from '@/modelTypes/IProject'
import type {TaskFilterParams} from '@/services/taskCollection'
import {getDefaultTaskFilterParams} from '@/services/taskCollection'

import type {DateISO} from '@/types/DateISO'
import type {IProjectView} from '@/modelTypes/IProjectView'

// convenient internal filter object
export interface GanttFilters {
	projectId: IProject['id']
	viewId: IProjectView['id'],
	dateFrom: DateISO
	dateTo: DateISO
	showTasksWithoutDates: boolean
}

export const DEFAULT_SHOW_TASKS_WITHOUT_DATES = false

const DEFAULT_DATEFROM_DAY_OFFSET = -15
const DEFAULT_DATETO_DAY_OFFSET = +55

export function getDefaultDateFrom() {
       const now = new Date()
       return new Date(now.getFullYear(), now.getMonth(), now.getDate() + DEFAULT_DATEFROM_DAY_OFFSET).toISOString()
}

export function getDefaultDateTo() {
       const now = new Date()
       return new Date(now.getFullYear(), now.getMonth(), now.getDate() + DEFAULT_DATETO_DAY_OFFSET).toISOString()
}

export const ganttRouteParamsSchema = object({
       projectId: coerce.number().int(),
       viewId: coerce.number().int(),
})

export const ganttRouteQuerySchema = object({
       dateFrom: preprocess((v: unknown) => parseDateProp(v as string | undefined), string().default(getDefaultDateFrom())),
       dateTo: preprocess((v: unknown) => parseDateProp(v as string | undefined), string().default(getDefaultDateTo())),
       showTasksWithoutDates: preprocess((v: unknown) => {
               const str = v as string | undefined
               if (str === 'true' || str === '1') return true
               if (str === 'false' || str === '0') return false
               return undefined
       }, boolean().default(DEFAULT_SHOW_TASKS_WITHOUT_DATES)),
})

export function ganttRouteToFilters(route: Partial<RouteLocationNormalized>): GanttFilters {
       const paramsResult = ganttRouteParamsSchema.safeParse(route.params ?? {})
       const params = paramsResult.success ? paramsResult.data : {projectId: 0, viewId: 0}

       const queryResult = ganttRouteQuerySchema.safeParse(route.query ?? {})
       const query = queryResult.success ? queryResult.data : {
               dateFrom: getDefaultDateFrom(),
               dateTo: getDefaultDateTo(),
               showTasksWithoutDates: DEFAULT_SHOW_TASKS_WITHOUT_DATES,
       }

       return {
               projectId: params.projectId,
               viewId: params.viewId,
               dateFrom: query.dateFrom,
               dateTo: query.dateTo,
               showTasksWithoutDates: query.showTasksWithoutDates,
       }
}

export function ganttGetDefaultFilters(route: Partial<RouteLocationNormalized>): GanttFilters {
	return ganttRouteToFilters({params: {
		projectId: route.params?.projectId as string,
		viewId: route.params?.viewId as string,
	}})
}

export function ganttFiltersToRoute(filters: GanttFilters): RouteLocationRaw {
       const params = ganttRouteParamsSchema.parse({
               projectId: filters.projectId,
               viewId: filters.viewId,
       })

       const queryObj = ganttRouteQuerySchema.parse({
               dateFrom: isoToKebabDate(filters.dateFrom),
               dateTo: isoToKebabDate(filters.dateTo),
               showTasksWithoutDates: String(filters.showTasksWithoutDates),
       })

       const query: Record<string, string> = {}
       if (
               queryObj.dateFrom !== getDefaultDateFrom() ||
               queryObj.dateTo !== getDefaultDateTo()
       ) {
               query.dateFrom = isoToKebabDate(filters.dateFrom)
               query.dateTo = isoToKebabDate(filters.dateTo)
       }

       if (queryObj.showTasksWithoutDates) {
               query.showTasksWithoutDates = String(queryObj.showTasksWithoutDates)
       }

       return {
               name: 'project.view',
               params,
               query,
       }
}

export function ganttFiltersToApiParams(filters: GanttFilters): TaskFilterParams {
       return {
               ...getDefaultTaskFilterParams(),
               sort_by: ['start_date', 'done', 'id'],
               order_by: ['asc', 'asc', 'desc'],
               filter: 'start_date >= "' + isoToKebabDate(filters.dateFrom) + '" && start_date <= "' + isoToKebabDate(filters.dateTo) + '"',
               filter_include_nulls: filters.showTasksWithoutDates,
       }
}

export type UseGanttFiltersReturn =
	ReturnType<typeof useRouteFilters<GanttFilters>> &
	ReturnType<typeof useGanttTaskList<GanttFilters>>

export function useGanttFilters(route: Ref<RouteLocationNormalized>, viewId: Ref<IProjectView['id']>): UseGanttFiltersReturn {
	const {
		filters,
		hasDefaultFilters,
		setDefaultFilters,
	} = useRouteFilters<GanttFilters>(
		route,
		ganttGetDefaultFilters,
		ganttRouteToFilters,
		ganttFiltersToRoute,
		['project.view'],
	)

	const {
		tasks,
		loadTasks,

		isLoading,
		addTask,
		updateTask,
	} = useGanttTaskList<GanttFilters>(filters, ganttFiltersToApiParams, viewId)

	return {
		filters,
		hasDefaultFilters,
		setDefaultFilters,

		tasks,
		loadTasks,

		isLoading,
		addTask,
		updateTask,
	}
}
