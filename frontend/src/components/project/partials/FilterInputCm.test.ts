import {mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import {describe, it, expect} from 'vitest'

import FilterInputCm from './FilterInputCm.vue'

function getView(wrapper: any) {
        return (wrapper.vm as any).view.value
}

describe('FilterInputCm', () => {
        it.skip('initializes with modelValue and updates view when prop changes', async () => {
                const wrapper = mount(FilterInputCm, {props: {modelValue: 'foo'}})
                await nextTick()
                await nextTick()

                const view = getView(wrapper)
                expect((wrapper.vm as any).model.value).toBe('foo')
                expect(view.state.doc.toString()).toBe('foo')

                await wrapper.setProps({modelValue: 'bar'})
                await nextTick()

                expect(view.state.doc.toString()).toBe('bar')
        })

        it.skip('emits update when user edits the document', async () => {
                const wrapper = mount(FilterInputCm, {props: {modelValue: ''}})
                await nextTick()
                await nextTick()

                const view = getView(wrapper)
                view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: 'baz'}})
                await nextTick()

                expect(wrapper.emitted('update:modelValue')).toEqual([['baz']])
                expect((wrapper.vm as any).model.value).toBe('baz')
        })
})
