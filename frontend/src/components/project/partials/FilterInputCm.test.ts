import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import FilterInputCm from './FilterInputCm.vue'

describe('FilterInputCm', () => {
       it('syncs prop changes to the internal query', async () => {
               const wrapper = mount(FilterInputCm, {props: {modelValue: 'foo'}})

               await nextTick()

               const query = (wrapper.vm as any).$?.setupState.query

               expect(query.value).toBe('foo')

               await wrapper.setProps({modelValue: 'bar'})
               await nextTick()

               expect(query.value).toBe('bar')
       })

       it('emits updates when the query changes', async () => {
               const wrapper = mount(FilterInputCm, {props: {modelValue: 'foo'}})

               await nextTick()

               const query = (wrapper.vm as any).$?.setupState.query
               query.value = 'baz'
               await nextTick()

               expect(wrapper.emitted('update:modelValue')).toEqual([['baz']])
       })
})
