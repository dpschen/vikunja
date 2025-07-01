import {VueRenderer} from '@tiptap/vue-3'
import tippy from 'tippy.js'

import CommandsList from './CommandsList.vue'
import {
    faFont,
    faHeader,
    faListUl,
    faListOl,
    faListCheck,
    faQuoteRight,
    faCode,
    faImage,
    faRulerHorizontal,
} from '@/components/misc/Icon'

export default function suggestionSetup(t) {
    return {
        items: ({query}: { query: string }) => {
            return [
                {
                    title: t('input.editor.text'),
                    description: t('input.editor.textTooltip'),
                    icon: faFont,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setNode('paragraph', {level: 1})
                            .run()
                    },
                },
                {
                    title: t('input.editor.heading1'),
                    description: t('input.editor.heading1Tooltip'),
                    icon: faHeader,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setNode('heading', {level: 1})
                            .run()
                    },
                },
                {
                    title: t('input.editor.heading2'),
                    description: t('input.editor.heading2Tooltip'),
                    icon: faHeader,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setNode('heading', {level: 2})
                            .run()
                    },
                },
                {
                    title: t('input.editor.heading3'),
                    description: t('input.editor.heading3Tooltip'),
                    icon: faHeader,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setNode('heading', {level: 2})
                            .run()
                    },
                },
                {
                    title: t('input.editor.bulletList'),
                    description: t('input.editor.bulletListTooltip'),
                    icon: faListUl,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .toggleBulletList()
                            .run()
                    },
                },
                {
                    title: t('input.editor.orderedList'),
                    description: t('input.editor.orderedListTooltip'),
                    icon: faListOl,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .toggleOrderedList()
                            .run()
                    },
                },
                {
                    title: t('input.editor.taskList'),
                    description: t('input.editor.taskListTooltip'),
                    icon: faListCheck,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .toggleTaskList()
                            .run()
                    },
                },
                {
                    title: t('input.editor.quote'),
                    description: t('input.editor.quoteTooltip'),
                    icon: faQuoteRight,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .toggleBlockquote()
                            .run()
                    },
                },
                {
                    title: t('input.editor.code'),
                    description: t('input.editor.codeTooltip'),
                    icon: faCode,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .toggleCodeBlock()
                            .run()
                    },
                },
                {
                    title: t('input.editor.image'),
                    description: t('input.editor.imageTooltip'),
                    icon: faImage,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .run()
                        document.getElementById('tiptap__image-upload').click()
                    },
                },
                {
                    title: t('input.editor.horizontalRule'),
                    description: t('input.editor.horizontalRuleTooltip'),
                    icon: faRulerHorizontal,
                    command: ({editor, range}) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .setHorizontalRule()
                            .run()
                    },
                },
            ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
        },

        render: () => {
            let component: VueRenderer
            let popup

            return {
                onStart: props => {
                    component = new VueRenderer(CommandsList, {
                        // using vue 2:
                        // parent: this,
                        // propsData: props,
                        props,
                        editor: props.editor,
                    })

                    if (!props.clientRect) {
                        return
                    }

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    })
                },

                onUpdate(props) {
                    component.updateProps(props)

                    if (!props.clientRect) {
                        return
                    }

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    })
                },

                onKeyDown(props) {
                    if (props.event.key === 'Escape') {
                        popup[0].hide()

                        return true
                    }

                    return component.ref?.onKeyDown(props)
                },

                onExit() {
                    popup[0].destroy()
                    component.destroy()
                },
            }
        },
    }
}
