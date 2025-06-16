const SIZES = [
	'B',
	'KB',
	'MB',
	'GB',
	'TB',
] as const

const SIZE_MAP = SIZES.reduce<Record<string, number>>((acc, unit, index) => {
	acc[unit.toLowerCase()] = 1024 ** index
	return acc
}, {})

export function getHumanSize(inputSize: number) {
	let iterator = 0
	let size = inputSize
	while (size > 1024) {
		size /= 1024
		iterator++
	}

	return Number(Math.round(Number(size + 'e2')) + 'e-2') + ' ' + SIZES[iterator]
}

export function parseHumanSize(input: string): number {
	const match = input.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)?$/)
	if (!match) {
	    return Number(input)
	}
	const [, value, unit] = match
	const multiplier = SIZE_MAP[unit || 'b'] || 1
	return Math.round(parseFloat(value) * multiplier)
}
