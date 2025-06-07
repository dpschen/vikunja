import {ref} from 'vue'
import type {ComponentPublicInstance} from 'vue'

export function useDropdownNavigation<T extends Element | ComponentPublicInstance>() {
        const selectedIndex = ref(-1)
        const resultRefs = ref<(T | null)[]>([])

        function setResultRef(el: T | null, index: number) {
                if (el === null) {
                        delete resultRefs.value[index]
                        return
                }
                resultRefs.value[index] = el
        }

        function focusItem(index: number) {
                if (index < 0) {
                        selectedIndex.value = -1
                        return
                }
                const elem = resultRefs.value[index]
                if (typeof elem === 'undefined') {
                        return
                }
                selectedIndex.value = index
                if (Array.isArray(elem)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (elem[0] as any)?.focus?.()
                        return
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (elem as any)?.focus?.()
        }

        function moveSelection(offset: number) {
                if (resultRefs.value.length === 0) {
                        return
                }
                let index = selectedIndex.value + offset
                if (!isFinite(index)) {
                        index = 0
                }
                const len = resultRefs.value.length
                if (index >= len) {
                        index = 0
                }
                if (index < 0) {
                        index = len - 1
                }
                focusItem(index)
        }

        return {
                selectedIndex,
                resultRefs,
                setResultRef,
                focusItem,
                moveSelection,
        }
}
