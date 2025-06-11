import {describe, it, expectTypeOf} from 'vitest'
import type {RouteLocationNormalized, RouteLocationRaw} from 'vue-router'
import {useRouteFilters, type UseRouteFiltersReturn} from './useRouteFilters'
import {ref} from 'vue'

interface DummyFilters {foo: string}

describe('useRouteFilters type inference', () => {
        it('should infer return types based on filter interface', () => {
                type Result = ReturnType<typeof useRouteFilters<DummyFilters>>
                expectTypeOf<Result>().toEqualTypeOf<UseRouteFiltersReturn<DummyFilters>>()
        })
})
