import {describe, expect, it} from 'vitest'
import {getInheritedBackgroundColor} from './getInheritedBackgroundColor'

describe('getInheritedBackgroundColor', () => {
	it('returns the element\'s background color', () => {
		const el = document.createElement('div')
		el.style.backgroundColor = 'rgb(255, 0, 0)'
		document.body.appendChild(el)

		const result = getInheritedBackgroundColor(el)

		document.body.removeChild(el)
		expect(result).toBe('rgb(255, 0, 0)')
	})

	it('gets color from parent when element is transparent', () => {
		const parent = document.createElement('div')
		parent.style.backgroundColor = 'rgb(0, 255, 0)'
		const child = document.createElement('div')
		child.style.backgroundColor = 'rgba(0, 0, 0, 0)'
		parent.appendChild(child)
		document.body.appendChild(parent)

		const result = getInheritedBackgroundColor(child)

		document.body.removeChild(parent)
		expect(result).toBe('rgb(0, 255, 0)')
	})

	it('falls back to document background when none found', () => {
		const el = document.createElement('div')
		document.body.appendChild(el)
		const defaultBg = getComputedStyle(document.documentElement).backgroundColor

		const result = getInheritedBackgroundColor(el)

		document.body.removeChild(el)
		expect(result).toBe(defaultBg)
	})
})
