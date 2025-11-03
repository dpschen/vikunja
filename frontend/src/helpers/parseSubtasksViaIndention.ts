import {getProjectFromPrefix, PrefixMode} from '@/modules/parseTaskText'

export interface TaskWithParent {
	title: string,
	parent: string | null,
	project: string | null,
}

function cleanupTitle(title: string) {
	// Preserve the original helper semantics of stripping list markers and empty checkboxes
	return title.replace(/^((\* |\+ |- )(\[ \] )?)/g, '')
}

// Reuse a single segmenter instance so every function shares consistent grapheme boundaries
const graphemeSegmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'})

function getLeadingWhitespaceMetrics(title: string) {
	// Count each leading whitespace grapheme and remember the slice index where the content begins
	let segments = 0
	let sliceIndex = 0

	for (const {segment, index} of graphemeSegmenter.segment(title)) {
		if (segment === ' ' || segment === '\t') {
			segments += 1
			sliceIndex = index + segment.length
			continue
		}

		break
	}

	return {segments, sliceIndex}
}

function stripLeadingWhitespaceSegments(title: string, segmentsToRemove: number) {
	if (segmentsToRemove === 0) {
		return title
	}

	let removedSegments = 0
	let sliceIndex = 0

	for (const {segment, index} of graphemeSegmenter.segment(title)) {
		if (segment === ' ' || segment === '\t') {
			removedSegments += 1
			sliceIndex = index + segment.length

			if (removedSegments === segmentsToRemove) {
				break
			}

			continue
		}

		break
	}

	return title.slice(sliceIndex)
}

/**
 * Parse tasks separated by newlines into a parent/subtask hierarchy derived from indentation.
 *
 * @param taskTitles Raw quick-add text containing one task title per line.
 * @param prefixMode Project prefix parsing mode used to resolve explicit project assignments.
 */
export function parseSubtasksViaIndention(taskTitles: string, prefixMode: PrefixMode): TaskWithParent[] {
	let titles = taskTitles
		.split(/[\r\n]+/)
		// Remove titles that are empty or only contain whitespace to avoid creating blank tasks
		.filter(t => t.replace(/\s/g, '').length > 0)

	if (titles.length === 0) {
		return []
	}

	const {segments: initialLeadingSegments} = getLeadingWhitespaceMetrics(titles[0])
	if (initialLeadingSegments > 0) {
		let sharedLeadingSegments = initialLeadingSegments

		for (const title of titles) {
			const {segments} = getLeadingWhitespaceMetrics(title)
			if (segments === 0) {
				sharedLeadingSegments = 0
				break
			}

			if (segments < sharedLeadingSegments) {
				sharedLeadingSegments = segments
			}
		}

		if (sharedLeadingSegments > 0) {
			// Normalize every line by removing the shared indentation baseline before parsing
			titles = titles.map(title => stripLeadingWhitespaceSegments(title, sharedLeadingSegments))
		}
	}

	const parsedTitles = titles.map(title => {
		const {segments: indentSegments, sliceIndex} = getLeadingWhitespaceMetrics(title)
		const indent = indentSegments
		const withoutIndent = sliceIndex > 0 ? title.slice(sliceIndex) : title
		const cleaned = cleanupTitle(withoutIndent)

		return {
			indent,
			cleaned,
			project: getProjectFromPrefix(cleaned, prefixMode),
		}
	})

	return parsedTitles.map((taskData, index) => {
		const task: TaskWithParent = {
			title: taskData.cleaned,
			parent: null,
			project: taskData.project,
		}

		if (index === 0 || taskData.indent === 0) {
			return task
		}

		// Walk up the parsed stack to find the nearest parent with a lower indentation level
		for (let parentIndex = index - 1; parentIndex >= 0; parentIndex--) {
			const potentialParent = parsedTitles[parentIndex]

			if (potentialParent.indent < taskData.indent) {
				task.parent = potentialParent.cleaned
				if (task.project === null) {
					// Allow specifying a project once on the parent and inheriting it for all nested subtasks
					task.project = potentialParent.project
				}
				break
			}
		}

		return task
	})
}
