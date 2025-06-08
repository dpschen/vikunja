import {shallowMount, flushPromises} from '@vue/test-utils'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {setActivePinia, createPinia} from 'pinia'

import TaskDetailView from './TaskDetailView.vue'
import {useKanbanStore} from '@/stores/kanban'
import {useBaseStore} from '@/stores/base'
import BucketModel from '@/models/bucket'
import TaskModel from '@/models/task'

vi.mock('vuemoji-picker', () => ({default: {}}))
vi.mock('@/services/task', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(async () => new TaskModel({id: 1, projectId: 1, bucketId: 1}))
  }))
}))

const updateMock = vi.fn(async (m: any) => ({
  bucketId: m.bucketId,
  task: {id: m.taskId, bucketId: m.bucketId},
}))

vi.mock('@/services/taskBucket', () => ({
  default: vi.fn().mockImplementation(() => ({
    update: updateMock,
  }))
}))

function setupStores() {
  setActivePinia(createPinia())
  const base = useBaseStore()
  base.setCurrentProject({id: 1} as any, 1)
  const kanban = useKanbanStore()
  kanban.setBuckets([
    new BucketModel({id: 1, title: 'A', projectId: 1, tasks: []}),
    new BucketModel({id: 2, title: 'B', projectId: 1, tasks: []}),
  ])
  return {kanban}
}

describe('TaskDetailView move bucket', () => {
  beforeEach(() => {
    updateMock.mockClear()
  })

  it('updates bucket via service and store', async () => {
    const {kanban} = setupStores()
    const wrapper = shallowMount(TaskDetailView, {props: {taskId: 1}, global: {stubs: {'vuemoji-picker': true}}})
    await flushPromises()

    await (wrapper.vm as any).changeBucket(2)
    expect(updateMock).toHaveBeenCalled()
    const res = kanban.getTaskById(1)
    expect(res.bucketIndex).toBe(1)
  })
})
