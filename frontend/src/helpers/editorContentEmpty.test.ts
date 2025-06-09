import {describe, expect, it} from 'vitest'
import {normalizeEditorContent, isEditorContentEmpty} from './editorContentEmpty'

describe('editor content helpers', () => {
    it('should detect empty html', () => {
        expect(isEditorContentEmpty('<p></p>')).toBe(true)
        expect(normalizeEditorContent('<p></p>')).toBe('')
    })

    it('should keep normal content', () => {
        const html = '<p>text</p>'
        expect(isEditorContentEmpty(html)).toBe(false)
        expect(normalizeEditorContent(html)).toBe(html)
    })
})
