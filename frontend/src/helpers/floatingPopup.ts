import {computePosition, autoUpdate, flip, shift, offset, Placement, VirtualElement} from '@floating-ui/dom'

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
    appendTo().appendChild(el)

    const update = () => {
        computePosition(reference, el, {
            placement,
            middleware: [offset(0), flip(), shift()],
        }).then(({x, y}) => {
            Object.assign(el.style, {
                left: `${x}px`,
                top: `${y}px`,
            })
        })
    }

    const cleanup = autoUpdate(reference, el, update)
    update()

    return {
        element: el,
        show() {
            el.style.display = ''
            update()
        },
        hide() {
            el.style.display = 'none'
        },
        destroy() {
            cleanup()
            el.remove()
        },
        setProps({getReferenceClientRect: fn}: {getReferenceClientRect: () => DOMRect}) {
            reference.getBoundingClientRect = fn
            update()
        },
    }
}
