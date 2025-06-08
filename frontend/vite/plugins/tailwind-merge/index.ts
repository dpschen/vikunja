import type {Plugin} from 'vite'
import {twMerge} from './helper'

const CLASS_REGEX = /(\bclass=|:class=)("|')(.*?)\2/g

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
                    return match
                }
            })
        },
    }
}
