export function normalizeEditorContent(content: string): string {
       const html = content.trim()
       if (html === '' || html === '<p></p>' || html === '<p><br></p>') {
               return ''
       }

       return content
}

export function isEditorContentEmpty(content: string): boolean {
       return normalizeEditorContent(content) === ''
}
