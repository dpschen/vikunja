import {computePosition, autoUpdate, flip, shift, offset} from '@floating-ui/dom'
import type {Placement, VirtualElement} from '@floating-ui/dom'

interface Options {
    getReferenceClientRect: () => DOMRect
    content: HTMLElement | string
    placement?: Placement
    appendTo?: () => HTMLElement
}

export function createFloatingPopup(options: Options) {
    const {
        getReferenceClientRect,
        content,
        placement = 'bottom-start',
        appendTo = () => document.body,
    } = options

    const reference: VirtualElement = {
        getBoundingClientRect: getReferenceClientRect,
    }

    const el: HTMLElement = typeof content === 'string'
        ? (() => {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = content
            return wrapper.firstElementChild as HTMLElement || wrapper
        })()
        : content

    el.style.position = 'absolute'
    el.style.left = '0'
    el.style.top = '0'
    appendTo().appendChild(el)

    const update = async () => {
        const {x, y} = await computePosition(reference, el, {
            placement,
            middleware: [offset(0), flip(), shift()],
        })
        el.style.transform = `translateX(${Math.round(x)}px) translateY(${Math.round(y)}px)`
    }

    const cleanup = autoUpdate(reference, el, update)
    update()

    return {
        element: el,
        async show() {
            el.style.display = ''
            await update()
        },
        hide() {
            el.style.display = 'none'
        },
        destroy() {
            cleanup()
            el.remove()
        },
        async setProps({getReferenceClientRect: fn}: {getReferenceClientRect: () => DOMRect}) {
            reference.getBoundingClientRect = fn
            await update()
        },
    }
}
