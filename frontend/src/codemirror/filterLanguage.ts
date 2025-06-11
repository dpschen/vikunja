import {LRLanguage, LanguageSupport} from '@codemirror/language'
import {styleTags, tags as t} from '@lezer/highlight'
import {parser} from './filterLang.js'

const filterLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Field: t.keyword,
        Operator: t.operator,
        Join: t.operator,
        Number: t.number,
        Word: t.variableName,
        DString: t.string,
        SString: t.string,
      }),
    ],
  }),
})

export function filterLanguageSupport() {
  return new LanguageSupport(filterLanguage)
}
