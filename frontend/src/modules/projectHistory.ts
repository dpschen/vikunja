import {useStorage} from '@vueuse/core'

export interface ProjectHistory {
       id: number;
}

export const projectHistory = useStorage<ProjectHistory[]>('projectHistory', [])

const MAX_SAVED_PROJECTS = 6

export function saveProjectToHistory(project: ProjectHistory) {
       const history: ProjectHistory[] = projectHistory.value

	// Remove the element if it already exists in history, preventing duplicates and essentially moving it to the beginning
	history.forEach((l, i) => {
		if (l.id === project.id) {
			history.splice(i, 1)
		}
	})

	// Add the new project to the beginning of the project
	history.unshift(project)

	if (history.length > MAX_SAVED_PROJECTS) {
		history.pop()
	}
       projectHistory.value = history
}

export function removeProjectFromHistory(project: ProjectHistory) {
       const history: ProjectHistory[] = projectHistory.value

	history.forEach((l, i) => {
		if (l.id === project.id) {
			history.splice(i, 1)
		}
	})
       projectHistory.value = history
}
