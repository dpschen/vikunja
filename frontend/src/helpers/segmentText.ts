export interface TextSegment {
	segment: string,
	index: number,
	isWordLike: boolean,
}

const segmenterCache = new Map<string, Intl.Segmenter>()
const wordLikeRegex = /[\p{L}\p{N}]/u

const getIntlSegmenter = (granularity: Intl.SegmenterOptions['granularity'] = 'word'): Intl.Segmenter | null => {
	if (typeof Intl === 'undefined' || typeof Intl.Segmenter === 'undefined') {
		return null
	}

	if (!segmenterCache.has(granularity)) {
		segmenterCache.set(granularity, new Intl.Segmenter(undefined, {granularity}))
	}

	return segmenterCache.get(granularity) ?? null
}

interface SegmentLike {
	segment: string,
	index: number,
	isWordLike?: boolean,
}

const toTextSegment = (segment: SegmentLike): TextSegment => ({
	segment: segment.segment,
	index: segment.index,
	isWordLike: segment.isWordLike ?? wordLikeRegex.test(segment.segment),
})

const fallbackSegmentText = (text: string): TextSegment[] => {
	const segments: TextSegment[] = []
	const regex = /([\p{L}\p{N}]+|[\p{Z}\s]+|.)/gu
	let match: RegExpExecArray | null

	while ((match = regex.exec(text)) !== null) {
		const part = match[0]
		segments.push({
			segment: part,
			index: match.index,
			isWordLike: wordLikeRegex.test(part),
		})
	}

	return segments
}

export const segmentText = (text: string, granularity: Intl.SegmenterOptions['granularity'] = 'word'): TextSegment[] => {
	const segmenter = getIntlSegmenter(granularity)
	if (segmenter === null) {
		return fallbackSegmentText(text)
	}

	return Array.from(segmenter.segment(text)).map(segment => toTextSegment(segment as SegmentLike))
}

export const getWordTokens = (text: string): string[] =>
	segmentText(text).filter(segment => segment.isWordLike).map(segment => segment.segment)

export const isWhitespaceSegment = (segment: TextSegment | undefined): boolean => {
	if (!segment) {
		return false
	}

	return segment.segment.trim() === ''
}
