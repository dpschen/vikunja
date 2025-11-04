import {describe, expect, it} from 'vitest'

import {getWordTokens, isWhitespaceSegment, segmentText} from './segmentText'

const NBSP = '\u00A0'
const IDEOGRAPHIC_SPACE = '\u3000'

describe('segmentText', () => {
        it('treats non-breaking spaces as standalone whitespace segments', () => {
                const text = `alpha${NBSP}beta`

                const segments = segmentText(text)
                const whitespace = segments.find(segment => segment.segment.includes(NBSP))

                expect(whitespace).toBeDefined()
                expect(isWhitespaceSegment(whitespace)).toBe(true)
                expect(getWordTokens(text)).toStrictEqual(['alpha', 'beta'])
        })

        it('falls back to regex-based segmentation when Intl.Segmenter is unavailable', () => {
                const text = `gamma${IDEOGRAPHIC_SPACE}delta`
                const originalIntl = globalThis.Intl
                // @ts-expect-error overriding Intl for fallback verification
                globalThis.Intl = undefined

                try {
                        const segments = segmentText(text)
                        const whitespace = segments.find(segment => segment.segment.includes(IDEOGRAPHIC_SPACE))

                        expect(whitespace).toBeDefined()
                        expect(isWhitespaceSegment(whitespace)).toBe(true)
                        expect(getWordTokens(text)).toStrictEqual(['gamma', 'delta'])
                } finally {
                        globalThis.Intl = originalIntl
                }
        })
})
