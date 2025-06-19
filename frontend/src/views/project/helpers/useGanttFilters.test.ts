import {describe, expect, it} from 'vitest'
import {ganttRouteToFilters, ganttFiltersToRoute, getDefaultDateFrom, getDefaultDateTo, DEFAULT_SHOW_TASKS_WITHOUT_DATES} from './useGanttFilters'
import type {RouteLocationNormalized} from 'vue-router'

describe('gantt filter conversions', () => {
    it('converts route params to filters and back', () => {
        const route: Partial<RouteLocationNormalized> = {
            params: {projectId: '1', viewId: '2'},
            query: {
                dateFrom: '2025-01-01',
                dateTo: '2025-02-01',
                showTasksWithoutDates: 'true',
            },
        }

        const filters = ganttRouteToFilters(route)
        expect(filters).toStrictEqual({
            projectId: 1,
            viewId: 2,
            dateFrom: '2025-01-01T00:00:00.000Z',
            dateTo: '2025-02-01T00:00:00.000Z',
            showTasksWithoutDates: true,
        })

        const back = ganttFiltersToRoute(filters)
        expect(back.params).toStrictEqual({projectId: 1, viewId: 2})
        expect(back.query).toStrictEqual({
            dateFrom: '2025-01-01',
            dateTo: '2025-02-01',
            showTasksWithoutDates: 'true',
        })
    })

    it('falls back to defaults for invalid route data', () => {
        const route: Partial<RouteLocationNormalized> = {
            params: {projectId: 'a', viewId: 'b'},
            query: {
                dateFrom: 'not-a-date',
                dateTo: 'also-bad',
                showTasksWithoutDates: 'nope',
            },
        }

        const filters = ganttRouteToFilters(route)
        expect(filters.projectId).toBe(0)
        expect(filters.viewId).toBe(0)
        expect(filters.dateFrom).toBe(getDefaultDateFrom())
        expect(filters.dateTo).toBe(getDefaultDateTo())
        expect(filters.showTasksWithoutDates).toBe(DEFAULT_SHOW_TASKS_WITHOUT_DATES)
    })
})
