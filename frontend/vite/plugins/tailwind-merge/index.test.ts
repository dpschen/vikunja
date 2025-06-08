import {it, expect} from 'vitest'
import tailwindMergePlugin from './index'

it('merges duplicate classes', () => {
    const plugin = tailwindMergePlugin()
    const code = `<template><div class="tw-bg-blue-500 tw-bg-red-500"></div></template>`
    const result = (plugin as any).transform(code, 'Component.vue') as string
    expect(result).toContain('class="tw-bg-red-500"')
})
