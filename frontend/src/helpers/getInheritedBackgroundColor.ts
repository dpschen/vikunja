/**
 * Get the browser’s default background color (usually transparent).
 * We only call this once, so we avoid inserting dummy elements or
 * recomputing on every iteration.
 */
function getDefaultBG(): string {
	return getComputedStyle(document.documentElement).backgroundColor
}

/**
 * Normalize “transparent” values:
 *	 • keyword "transparent"
 *	 • rgba(0, 0, 0, 0)
 */
function isTransparent(color: string): boolean {
	return color === 'transparent'
		|| color === 'rgba(0, 0, 0, 0)'
}

/**
 * Walks up the DOM from `el` until we find a non-default background.
 *
 * Notes / Future ideas:
 *	  • We could migrate to the CSS Typed OM API to get typed
 *		color values (no string parsing, better comparisons).
 *	  • Alternatively, lean on the cascade by tracking your page’s
 *		background in a CSS custom‐property (e.g. “--bg”) and simply
 *		read that—no tree-walking needed.
 */
export function getInheritedBackgroundColor(el: HTMLElement): string {
	const DEFAULT_BG = getDefaultBG()

	let curr: HTMLElement | null = el
	while (curr) {
		// Only compute when we actually need to check this element
		const bg = getComputedStyle(curr).backgroundColor

		// If it’s neither the default nor transparent, that’s our answer
		if (!isTransparent(bg) && bg !== DEFAULT_BG) {
			return bg
		}

		curr = curr.parentElement
	}

	// Fell off the top: use whatever the default is
	return DEFAULT_BG
}
