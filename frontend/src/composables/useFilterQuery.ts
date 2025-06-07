import {computed, nextTick, ref, watch, type MaybeRefOrGetter, toValue} from 'vue'

import UserService from '@/services/user'
import ProjectUserService from '@/services/projectUsers'
import {useLabelStore} from '@/stores/labels'
import {useProjectStore} from '@/stores/projects'
import {
    ASSIGNEE_FIELDS,
    AUTOCOMPLETE_FIELDS,
    AVAILABLE_FILTER_FIELDS,
    DATE_FIELDS,
    FILTER_JOIN_OPERATOR,
    FILTER_OPERATORS,
    FILTER_OPERATORS_REGEX,
    getFilterFieldRegexPattern,
    LABEL_FIELDS,
} from '@/helpers/filters'

export function useFilterQuery(projectId?: MaybeRefOrGetter<number | undefined>) {
    const filterQuery = ref('')

    const userService = new UserService()
    const projectUserService = new ProjectUserService()
    const labelStore = useLabelStore()
    const projectStore = useProjectStore()

    function escapeHtml(unsafe: string | null | undefined): string {
        if (!unsafe) {
            return ''
        }
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    function unEscapeHtml(unsafe: string | null | undefined): string {
        if (!unsafe) {
            return ''
        }
        return unsafe
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot/g, '"')
            .replace(/&#039;/g, '\'')
    }

    const highlightedFilterQuery = computed(() => {
        if (filterQuery.value === '') {
            return ''
        }

        let highlighted = escapeHtml(filterQuery.value)
        DATE_FIELDS.forEach(o => {
            const pattern = new RegExp(o + '(\\s*)' + FILTER_OPERATORS_REGEX + '(\\s*)([\'"]?)([^\'"\\s]+\\1?)?', 'ig')
            highlighted = highlighted.replaceAll(pattern, (match, spacesBefore, token, spacesAfter, start, value, position) => {
                if (typeof value === 'undefined') {
                    value = ''
                }

                let endPadding = ''
                if (value.endsWith(' ')) {
                    const fullLength = value.length
                    value = value.trimEnd()
                    const numberOfRemovedSpaces = fullLength - value.length
                    endPadding = endPadding.padEnd(numberOfRemovedSpaces, ' ')
                }

                return `${o}${spacesBefore}${token}${spacesAfter}<button class="is-primary filter-query__date_value" data-position="${position}">${value}</button><span class="filter-query__date_value_placeholder">${value}</span>${endPadding}`
            })
        })
        ASSIGNEE_FIELDS.forEach(f => {
            const pattern = new RegExp(f + '\\s*' + FILTER_OPERATORS_REGEX + '\\s*([\'"]?)([^\'"\\s]+\\1?)?', 'ig')
            highlighted = highlighted.replaceAll(pattern, (match, token, start, value) => {
                if (typeof value === 'undefined') {
                    value = ''
                }

                return `${f} ${token} <span class="filter-query__assignee_value">${value}<span>`
            })
        })
        FILTER_JOIN_OPERATOR.map(o => escapeHtml(o)).forEach(o => {
            highlighted = highlighted.replaceAll(o, `<span class="filter-query__join-operator">${o}</span>`)
        })
        LABEL_FIELDS.forEach(f => {
            const pattern = getFilterFieldRegexPattern(f)
            highlighted = highlighted.replaceAll(pattern, (match, prefix, operator, space, value) => {
                if (typeof value === 'undefined') {
                    value = ''
                }

                let labelTitles = [value.trim()]
                if (operator === 'in' || operator === '?=' || operator === 'not in' || operator === '?!=') {
                    labelTitles = value.split(',').map(v => v.trim())
                }

                const labelsHtml: string[] = []
                labelTitles.forEach(t => {
                    const label = labelStore.getLabelByExactTitle(t) || undefined
                    labelsHtml.push(`<span class="filter-query__label_value" style="background-color: ${label?.hexColor}; color: ${label?.textColor}">${label?.title ?? t}</span>`)
                })

                const endSpace = value.endsWith(' ') ? ' ' : ''
                return `${f} ${operator} ${labelsHtml.join(', ')}${endSpace}`
            })
        })
        FILTER_OPERATORS.map(o => ` ${escapeHtml(o)} `).forEach(o => {
            highlighted = highlighted.replaceAll(o, `<span class="filter-query__operator">${o}</span>`)
        })
        AVAILABLE_FILTER_FIELDS.forEach(f => {
            highlighted = highlighted.replaceAll(f, `<span class="filter-query__field">${f}</span>`)
        })
        return highlighted
    })

    const currentOldDatepickerValue = ref('')
    const currentDatepickerValue = ref('')
    const currentDatepickerPos = ref<number>()
    const datePickerPopupOpen = ref(false)

    watch(
        () => highlightedFilterQuery.value,
        async () => {
            await nextTick()
            document.querySelectorAll('button.filter-query__date_value')
                .forEach(b => {
                    b.addEventListener('click', event => {
                        event.preventDefault()
                        event.stopPropagation()

                        const button = event.target as HTMLButtonElement
                        currentOldDatepickerValue.value = button?.innerText
                        currentDatepickerValue.value = button?.innerText
                        currentDatepickerPos.value = parseInt(button?.dataset.position || '0')
                        datePickerPopupOpen.value = true
                    })
                })
        },
        {immediate: true},
    )

    function updateDateInQuery(newDate: string) {
        let escaped = escapeHtml(filterQuery.value)
        escaped =
            escaped.substring(0, currentDatepickerPos.value) +
            escaped.substring(currentDatepickerPos.value).replace(currentOldDatepickerValue.value, newDate)
        currentOldDatepickerValue.value = newDate
        filterQuery.value = unEscapeHtml(escaped)
    }

    const autocompleteMatchPosition = ref(0)
    const autocompleteMatchText = ref('')
    const autocompleteResultType = ref<'labels' | 'assignees' | 'projects' | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const autocompleteResults = ref<any[]>([])

    function handleFieldInput(textarea: HTMLTextAreaElement | null) {
        if (!textarea) return
        const cursorPosition = textarea.selectionStart
        const textUpToCursor = filterQuery.value.substring(0, cursorPosition)
        autocompleteResults.value = []

        AUTOCOMPLETE_FIELDS.forEach(field => {
            const pattern = new RegExp('(' + field + '\\s*' + FILTER_OPERATORS_REGEX + '\\s*)([\'"]?)([^\'"&|()]+\\1?)?$', 'ig')
            const match = pattern.exec(textUpToCursor)

            if (match === null) {
                return
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [matched, prefix, operator, space, keyword] = match
            if (!keyword) {
                return
            }

            let search = keyword
            if (operator === 'in' || operator === '?=') {
                const keywords = keyword.split(',')
                search = keywords[keywords.length - 1].trim()
            }
            if (matched.startsWith('label')) {
                autocompleteResultType.value = 'labels'
                autocompleteResults.value = labelStore.filterLabelsByQuery([], search)
            }
            if (matched.startsWith('assignee')) {
                autocompleteResultType.value = 'assignees'
                const pid = toValue(projectId)
                if (pid) {
                    projectUserService.getAll({projectId: pid}, {s: search})
                        .then(users => autocompleteResults.value = users.length > 1 ? users : [])
                } else {
                    userService.getAll({}, {s: search})
                        .then(users => autocompleteResults.value = users.length > 1 ? users : [])
                }
            }
            if (!toValue(projectId) && matched.startsWith('project')) {
                autocompleteResultType.value = 'projects'
                autocompleteResults.value = projectStore.searchProject(search)
            }
            autocompleteMatchText.value = keyword
            autocompleteMatchPosition.value = match.index + prefix.length - 1 + keyword.replace(search, '').length
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function autocompleteSelect(value: any) {
        filterQuery.value =
            filterQuery.value.substring(0, autocompleteMatchPosition.value + 1) +
            (autocompleteResultType.value === 'assignees' ? value.username : value.title) +
            filterQuery.value.substring(autocompleteMatchPosition.value + autocompleteMatchText.value.length + 1)

        autocompleteResults.value = []
    }

    function updateQuery(newQuery: string) {
        filterQuery.value = newQuery
    }

    return {
        filterQuery,
        highlightedFilterQuery,
        currentDatepickerValue,
        datePickerPopupOpen,
        updateDateInQuery,
        autocompleteResults,
        autocompleteResultType,
        handleFieldInput,
        autocompleteSelect,
        updateQuery,
    }
}
