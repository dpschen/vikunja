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

interface StrippedWhitespaceResult {
	trimmed: string
	totalSegments: number
	segmentOffsets: number[]
	remainderSegments: Intl.SegmentData[]
}

function stripLeadingWhitespaceSegments(title: string, segmentsToRemove = 0): StrippedWhitespaceResult {
	// Record every offset produced while walking the iterator once so later consumers can reuse it
	const segmentOffsets: number[] = []
	const remainderSegments: Intl.SegmentData[] = []
	let trimmedSliceIndex = 0
	let hasContent = false

	for (const segmentData of graphemeSegmenter.segment(title)) {
		const {segment, index} = segmentData
		if (!hasContent && (segment === ' ' || segment === '\t')) {
			const nextIndex = index + segment.length
			segmentOffsets.push(nextIndex)

			if (segmentOffsets.length === segmentsToRemove) {
				trimmedSliceIndex = nextIndex
			}
			continue
		}

		if (!hasContent) {
			hasContent = true
			// When no baseline stripping is requested we can jump straight to the first non-whitespace index
			if (segmentsToRemove === 0) {
				trimmedSliceIndex = index
			} else if (trimmedSliceIndex === 0) {
				trimmedSliceIndex = segmentOffsets[Math.min(segmentsToRemove, segmentOffsets.length) - 1] ?? index
			}
		}

		remainderSegments.push(segmentData)
	}

	const totalSegments = segmentOffsets.length
	if (segmentsToRemove >= totalSegments && totalSegments > 0) {
		trimmedSliceIndex = segmentOffsets[totalSegments - 1]
	}

	return {
		trimmed: title.slice(trimmedSliceIndex),
		totalSegments,
		segmentOffsets,
		remainderSegments,
	}
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

	// Capture segmentation metadata for every line once so we can reuse it throughout the algorithm
	const baselineData = titles.map(title => ({
		title,
		analysis: stripLeadingWhitespaceSegments(title),
	}))

	// Identify the shared indentation baseline by finding the minimum leading whitespace depth
	let sharedLeadingSegments = baselineData[0].analysis.totalSegments
	for (const {analysis} of baselineData) {
		if (analysis.totalSegments === 0) {
			sharedLeadingSegments = 0
			break
		}

		if (analysis.totalSegments < sharedLeadingSegments) {
			sharedLeadingSegments = analysis.totalSegments
		}
	}

	const parsedTitles = baselineData.map(({title, analysis}) => {
		const totalIndentSegments = analysis.totalSegments
		const indent = Math.max(totalIndentSegments - sharedLeadingSegments, 0)
		const fullTrimIndex = totalIndentSegments > 0
			? analysis.segmentOffsets[totalIndentSegments - 1]
			: 0
		const trimmedTitle = fullTrimIndex > 0 ? title.slice(fullTrimIndex) : title
		const cleaned = cleanupTitle(trimmedTitle)

		return {
			indent,
			cleaned,
			project: getProjectFromPrefix(cleaned, prefixMode),
		}
	})

	// Maintain a stack of the latest task for each indentation depth to resolve parents in O(1)
	const stack: {indent: number; task: TaskWithParent}[] = []

	return parsedTitles.map(taskData => {
		const task: TaskWithParent = {
			title: taskData.cleaned,
			parent: null,
			project: taskData.project,
		}

		while (stack.length > 0 && stack[stack.length - 1].indent >= taskData.indent) {
			stack.pop()
		}

		const parentEntry = stack[stack.length - 1]
		if (parentEntry && taskData.indent > 0) {
			task.parent = parentEntry.task.title
			if (task.project === null) {
				task.project = parentEntry.task.project
			}
		}

		stack.push({indent: taskData.indent, task})
		return task
	})
}
