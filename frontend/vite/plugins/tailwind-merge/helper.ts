import {createTailwindMerge, getDefaultConfig} from 'tailwind-merge'

// Use the custom tw- prefix configured in tailwind.config.js
export const twMerge = createTailwindMerge(() => ({
    ...getDefaultConfig(),
    prefix: 'tw-'
}))

export function mergeClasses(...classes: string[]): string {
    return twMerge(classes.join(' '))
}
