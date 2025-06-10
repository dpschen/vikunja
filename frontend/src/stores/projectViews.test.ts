import {setActivePinia, createPinia} from 'pinia'
import {describe, it, expect, beforeEach, vi} from 'vitest'

import {useProjectViewStore} from './projectViews'
import ProjectService from '@/services/project'

describe('project view store caching', () => {
        beforeEach(() => {
                setActivePinia(createPinia())
        })

        it('should not call api when project is cached', async () => {
                const mock = vi.spyOn(ProjectService.prototype, 'get').mockResolvedValue({id: 1})
                const store = useProjectViewStore()
                await store.loadProject(1)
                await store.loadProject(1)
                expect(mock).toHaveBeenCalledTimes(1)
        })
})
