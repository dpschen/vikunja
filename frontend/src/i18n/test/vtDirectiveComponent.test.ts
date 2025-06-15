import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'

const messages = {en: {misc: {cancel: 'Cancel'}}}

const i18n = createI18n({legacy: false, locale: 'en', messages})

const SlotButton = {
  template: '<button><slot /></button>'
}

const vtDirective = {
  mounted(el: HTMLElement, {value}: {value: string}) {
    el.textContent = i18n.global.t(value as any)
  },
}

describe('v-t directive on component root', () => {
  it('replaces slot content with translation text', () => {
    const Comp = {
      components: {SlotButton},
      template: '<SlotButton v-t="\'misc.cancel\'"><span class="icon">Icon</span></SlotButton>'
    }
    const wrapper = mount(Comp, {global: {plugins: [i18n], directives: {t: vtDirective}}})
    expect(wrapper.html()).toBe('<button>Cancel</button>')
  })
})
