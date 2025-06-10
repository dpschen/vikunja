import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {ITask} from '@/modelTypes/ITask'

export const useDragTaskStore = defineStore('dragTask', () => {
        const draggedTaskId = ref<ITask['id'] | null>(null)
        function setDraggedTask(id: ITask['id'] | null) {
                draggedTaskId.value = id
        }
        return {draggedTaskId, setDraggedTask}
})
