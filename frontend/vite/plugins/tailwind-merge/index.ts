import type {Plugin} from 'vite'
import {twMerge} from './helper'

// Matches class attributes and :class bindings inside .vue files
const CLASS_REGEX = /(\bclass=|:class=)("|')(.*?)\2/g

/**
 * Vite plugin that merges static Tailwind classes at build time.
 * It runs before Vue transforms and rewrites the class attribute
 * with the result of `tailwind-merge` so parent styles take precedence.
 */
export default function tailwindMergePlugin(): Plugin {
    return {
        name: 'vite-plugin-tailwind-merge',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.vue')) return null
            return code.replace(CLASS_REGEX, (match, prefix, quote, classes) => {
                try {
                    const merged = twMerge(classes)
                    return `${prefix}${quote}${merged}${quote}`
                } catch {
                    // If merging fails just keep the original classes
                    return match
                }
            })
        },
    }
}
