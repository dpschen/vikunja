import {computed, ref, readonly} from 'vue'
import {defineStore, acceptHMRUpdate} from 'pinia'

import ProjectService from '@/services/project'
import TaskCollectionService, {type TaskFilterParams, getDefaultTaskFilterParams} from '@/services/taskCollection'
import type {IProject} from '@/modelTypes/IProject'
import type {ITask} from '@/modelTypes/ITask'
import type {IProjectView} from '@/modelTypes/IProjectView'
import {useAuthStore} from '@/stores/auth'

function taskKey(projectId: IProject['id'], viewId: IProjectView['id']) {
        return `${projectId}-${viewId}`
}

export const useProjectViewStore = defineStore('projectViews', () => {
        const authStore = useAuthStore()
        const projectService = new ProjectService()
        const taskService = new TaskCollectionService()

        const projects = ref<{[id: IProject['id']]: IProject}>({})
        const tasks = ref<{[key: string]: ITask[]}>({})
        const loadingTasks = ref<{[key: string]: boolean}>({})

        function setProject(project: IProject) {
                projects.value[project.id] = project
        }

        async function loadProject(id: IProject['id']) {
                if (projects.value[id]) {
                        return projects.value[id]
                }
                const p = await projectService.get({id})
                setProject(p)
                return p
        }

        async function loadTasks(
                projectId: IProject['id'],
                viewId: IProjectView['id'],
                params: TaskFilterParams = getDefaultTaskFilterParams(),
        ) {
                const key = taskKey(projectId, viewId)
                if (tasks.value[key]) {
                        return tasks.value[key]
                }
                loadingTasks.value[key] = true
                try {
                        const loaded = await taskService.getAll({projectId, viewId}, {
                                ...params,
                                filter_timezone: authStore.settings.timezone,
                        })
                        tasks.value[key] = loaded
                        return loaded
                } finally {
                        loadingTasks.value[key] = false
                }
        }

        function getTasks(projectId: IProject['id'], viewId: IProjectView['id']) {
                return tasks.value[taskKey(projectId, viewId)] || []
        }

        function setTasks(projectId: IProject['id'], viewId: IProjectView['id'], newTasks: ITask[]) {
                tasks.value[taskKey(projectId, viewId)] = newTasks
        }

        function updateTaskInCache(task: ITask) {
                Object.keys(tasks.value).forEach(k => {
                        const list = tasks.value[k]
                        const idx = list.findIndex(t => t.id === task.id)
                        if (idx !== -1) {
                                list[idx] = task
                        }
                })
        }

        function addTaskToCache(task: ITask) {
                Object.keys(tasks.value).forEach(k => {
                        if (k.startsWith(`${task.projectId}-`)) {
                                tasks.value[k].unshift(task)
                        }
                })
        }

        function clearProjectViewCache(projectId?: IProject['id']) {
                if (typeof projectId === 'undefined') {
                        tasks.value = {}
                        projects.value = {}
                        return
                }
                delete projects.value[projectId]
                Object.keys(tasks.value).forEach(k => {
                        if (k.startsWith(`${projectId}-`)) {
                                delete tasks.value[k]
                        }
                })
        }

        const isLoading = computed(() => {
                return (projectId: IProject['id'], viewId: IProjectView['id']) => {
                        return loadingTasks.value[taskKey(projectId, viewId)] || false
                }
        })

        return {
                projects: readonly(projects),
                tasks: readonly(tasks),

                isLoading,

                setProject,
                loadProject,
                loadTasks,
                getTasks,
                setTasks,
                updateTaskInCache,
                addTaskToCache,
                clearProjectViewCache,
        }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectViewStore, import.meta.hot))
}
