import {createRandomID} from '@/helpers/randomId'
import {createFloatingPopup} from '@/helpers/floatingPopup'
import {nextTick} from 'vue'
import {eventToHotkeyString} from '@github/hotkey'

export default function inputPrompt(pos: ClientRect, oldValue: string = ''): Promise<string> {
	return new Promise((resolve) => {
		const id = 'link-input-' + createRandomID()

               const linkPopup = createFloatingPopup({
                       getReferenceClientRect: () => pos,
                       appendTo: () => document.body,
                       content: `<div><input class="input" placeholder="URL" id="${id}" value="${oldValue}"/></div>`,
                       placement: 'top-start',
               })

               linkPopup.show()

		nextTick(() => document.getElementById(id)?.focus())

		document.getElementById(id)?.addEventListener('keydown', event => {
			const hotkeyString = eventToHotkeyString(event)
			if (hotkeyString !== 'Enter') {
				return
			}

			const url = event.target.value

			resolve(url)

                       linkPopup.hide()
		})

	})
}
