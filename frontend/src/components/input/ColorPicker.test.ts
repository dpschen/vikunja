import {mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import ColorPicker from './ColorPicker.vue'

const XButtonStub = {
    template: '<button @click="$emit(\'click\')"><slot /></button>'
}

describe('ColorPicker reset', () => {
    it('clears the color and highlights input', async () => {
        vi.useFakeTimers()
        const wrapper = mount(ColorPicker, {
            props: { modelValue: '#ffffff' },
            global: {
                stubs: { XButton: XButtonStub },
                config: { globalProperties: { $t: (k: string) => k } },
            },
        })
        await wrapper.find('button').trigger('click')
        await wrapper.vm.$nextTick()

        const input = wrapper.find('input')
        expect(input.classes()).toContain('was-reset')

        vi.advanceTimersByTime(500)
        await wrapper.vm.$nextTick()

        const emits = wrapper.emitted()['update:modelValue']
        expect(emits[emits.length - 1][0]).toBe('')

        vi.advanceTimersByTime(1000)
        await wrapper.vm.$nextTick()
        expect(input.classes()).not.toContain('was-reset')
        vi.useRealTimers()
    })
})
