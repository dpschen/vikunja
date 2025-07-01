import {mount} from '@vue/test-utils'
import {nextTick, ref} from 'vue'
import {describe, it, expect, vi, beforeEach} from 'vitest'

// Stub i18n composable used in the component
vi.mock('vue-i18n', () => ({
  useI18n: () => ({t: (s: string) => s}),
}))

// Stub the project i18n utilities
vi.mock('@/i18n', () => ({
  i18n: {},
  getBrowserLanguage: () => 'en',
}))

// Stub EditorToolbar to avoid relying on editor methods
vi.mock('@/components/input/editor/EditorToolbar.vue', () => ({
  default: {template: '<div></div>'},
}))

import TipTap from './TipTap.vue'

// Mock @tiptap/vue-3 components and composables
let editor: any
let onUpdate: () => void
const setContentMock = vi.fn()

vi.mock('@tiptap/vue-3', () => {
  return {
    EditorContent: {
      template: '<div></div>',
    },
    BubbleMenu: {
      template: '<div><slot /></div>',
    },
    useEditor: (options: any) => {
      onUpdate = options.onUpdate
      editor = {
        getHTML: vi.fn(() => '<p>new</p>'),
        commands: {
          setContent: setContentMock,
          focus: vi.fn(() => ({run: vi.fn()})),
        },
        isActive: vi.fn(() => false),
        setEditable: vi.fn(),
      }
      return ref(editor)
    },
  }
})

describe('TipTap.vue', () => {
  beforeEach(() => {
    setContentMock.mockClear()
    if (editor) {
      editor.getHTML.mockClear()
      editor.setEditable.mockClear()
    }
  })

  const globalMountOptions = {
    global: {
      stubs: ['Icon', 'RouterLink'],
      directives: {tooltip: () => {}, cy: () => {}},
      config: {
        globalProperties: {
          $t: (s: string) => s,
        },
      },
    },
  }

  it('initializes editor with modelValue', async () => {
    mount(TipTap, {props: {modelValue: '<p>hello</p>'}, ...globalMountOptions})
    await nextTick()
    expect(setContentMock).toHaveBeenCalledWith('<p>hello</p>', false)
  })

  it('emits update on editor change', async () => {
    const wrapper = mount(TipTap, {props: {modelValue: '<p>hello</p>'}, ...globalMountOptions})
    await nextTick()
    onUpdate()
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['<p>new</p>'])
  })

  it('updates editor when modelValue prop changes', async () => {
    const wrapper = mount(TipTap, {props: {modelValue: '<p>a</p>'}, ...globalMountOptions})
    await nextTick()
    setContentMock.mockClear()
    await wrapper.setProps({modelValue: '<p>b</p>'})
    await nextTick()
    expect(setContentMock).toHaveBeenCalledWith('<p>b</p>', false)
  })

  it('shows edit button when value is not empty', async () => {
    const wrapper = mount(TipTap, {props: {modelValue: '<p>a</p>'}, ...globalMountOptions})
    await nextTick()
    expect(wrapper.find('.done-edit').exists()).toBe(true)
  })

  it('hides edit button when value is empty', async () => {
    const wrapper = mount(TipTap, {props: {modelValue: ''}, ...globalMountOptions})
    await nextTick()
    expect(wrapper.find('.done-edit').exists()).toBe(false)
  })

  it('enters edit mode when clicking the edit button', async () => {
    const wrapper = mount(TipTap, {props: {modelValue: '<p>a</p>'}, ...globalMountOptions})
    await nextTick()
    await wrapper.find('.done-edit').trigger('click')
    await nextTick()
    expect(editor.setEditable).toHaveBeenCalledWith(true)
    expect(wrapper.find('.done-edit').exists()).toBe(false)
  })
})
