import {calculateDayInterval} from './calculateDayInterval'
import {calculateNearestHours} from './calculateNearestHours'
import {replaceAll} from '../replaceAll'
import {isWhitespaceSegment, segmentText, type TextSegment} from '../segmentText'

export interface dateParseResult {
	newText: string,
	date: Date | null,
}

interface dateFoundResult {
	foundText: string | null,
	date: Date | null,
}

const monthsRegexGroup = '(january|february|march|april|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'

const hourPattern = /^[0-9]{1,2}$/u
const inlineMeridiemPattern = /^([0-9]{1,2})([ap]m)$/iu
const minutePattern = /^[0-9]{2}$/u
const meridiemPattern = /^[ap]m$/iu

interface TimeMatch {
	matchText: string,
	time: string,
}

const findTimeMatch = (text: string): TimeMatch | null => {
	const segments = segmentText(text)

	for (let i = 0; i < segments.length; i++) {
		const current = segments[i]
		const lower = current.segment.toLocaleLowerCase()
		const isAtWord = current.isWordLike && lower === 'at'
		const isAtSymbol = current.segment === '@'

		if (!isAtWord && !isAtSymbol) {
			continue
		}

		if (i > 0 && !isWhitespaceSegment(segments[i - 1])) {
			continue
		}

		const match = extractTimeFromSegments(text, segments, i)
		if (match !== null) {
			return match
		}
	}

	return null
}

const extractTimeFromSegments = (text: string, segments: TextSegment[], index: number): TimeMatch | null => {
        let cursor = index + 1

        while (cursor < segments.length && isWhitespaceSegment(segments[cursor])) {
                cursor++
        }

        if (cursor >= segments.length) {
                return null
        }

        const hourSegment = segments[cursor]
        let endIndex = hourSegment.index + hourSegment.segment.length
        let timeString = ''
        let inlineMeridiem: string | null = null

        if (hourPattern.test(hourSegment.segment)) {
                timeString = hourSegment.segment
                cursor++
        } else {
                const inlineMeridiemMatch = inlineMeridiemPattern.exec(hourSegment.segment)
                if (inlineMeridiemMatch === null) {
                        return null
                }

                timeString = inlineMeridiemMatch[1]
                inlineMeridiem = inlineMeridiemMatch[2]
                cursor++
        }

        if (cursor < segments.length && segments[cursor].segment === ':') {
                if (cursor + 1 >= segments.length) {
                        return null
                }

                const minuteSegment = segments[cursor + 1]
                if (!minutePattern.test(minuteSegment.segment)) {
                        return null
                }

                timeString += `:${minuteSegment.segment}`
                endIndex = minuteSegment.index + minuteSegment.segment.length
                cursor += 2
        }

        let whitespaceAfterHour = ''
        if (cursor < segments.length && isWhitespaceSegment(segments[cursor])) {
                whitespaceAfterHour = segments[cursor].segment
                endIndex = segments[cursor].index + segments[cursor].segment.length
                cursor++
        }

        if (inlineMeridiem !== null) {
                timeString += inlineMeridiem
        } else if (cursor < segments.length && meridiemPattern.test(segments[cursor].segment)) {
                if (whitespaceAfterHour !== '') {
                        timeString += ' '
                }

                timeString += segments[cursor].segment
                endIndex = segments[cursor].index + segments[cursor].segment.length
                cursor++
        }

        const leadingIndex = index > 0 && isWhitespaceSegment(segments[index - 1]) ? segments[index - 1].index : segments[index].index
        const matchText = text.slice(leadingIndex, endIndex)

        return {
                matchText,
                time: timeString,
        }
}

const normalizeTokens = (tokens: string[]): string[] => tokens.map(token => token.toLocaleLowerCase())

const findDateExprMatch = (text: string, dateExpr: string): string | null => {
        const segments = segmentText(text)
        const wordSegments = segments
                .map((segment, segmentIndex) => ({segment, segmentIndex}))
                .filter(({segment}) => segment.isWordLike)
        const exprTokens = normalizeTokens(dateExpr.split(' ').map(part => part.trim()).filter(part => part !== ''))

        if (exprTokens.length === 0 || wordSegments.length < exprTokens.length) {
                return null
        }

        for (let i = 0; i <= wordSegments.length - exprTokens.length; i++) {
                let matches = true
                for (let j = 0; j < exprTokens.length; j++) {
                        if (wordSegments[i + j].segment.segment.toLocaleLowerCase() !== exprTokens[j]) {
                                matches = false
                                break
                        }
                }

                if (matches) {
                        const startSegment = wordSegments[i].segment
                        const startIndex = startSegment.index
                        if (startIndex > 0) {
                                const precedingChar = text[startIndex - 1]
                                if (precedingChar === '@') {
                                        continue
                                }
                        }

                        const lastSegment = wordSegments[i + exprTokens.length - 1].segment
                        const endIndex = lastSegment.index + lastSegment.segment.length

                        return text.slice(startIndex, endIndex)
                }
        }

        return null
}

export const parseDate = (text: string, now: Date = new Date()): dateParseResult => {
        const todayMatch = findDateExprMatch(text, 'today')
        if (todayMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('today')), todayMatch)
        }
        const tonightMatch = findDateExprMatch(text, 'tonight')
        if (tonightMatch !== null) {
                const taskDate = getDateFromInterval(calculateDayInterval('today'))
                taskDate.setHours(21)
                return addTimeToDate(text, taskDate, tonightMatch)
        }
        const tomorrowMatch = findDateExprMatch(text, 'tomorrow')
        if (tomorrowMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('tomorrow')), tomorrowMatch)
        }
        const nextMondayMatch = findDateExprMatch(text, 'next monday')
        if (nextMondayMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('nextMonday')), nextMondayMatch)
        }
        const thisWeekendMatch = findDateExprMatch(text, 'this weekend')
        if (thisWeekendMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('thisWeekend')), thisWeekendMatch)
        }
        const laterThisWeekMatch = findDateExprMatch(text, 'later this week')
        if (laterThisWeekMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('laterThisWeek')), laterThisWeekMatch)
        }
        const laterNextWeekMatch = findDateExprMatch(text, 'later next week')
        if (laterNextWeekMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('laterNextWeek')), laterNextWeekMatch)
        }
        const nextWeekMatch = findDateExprMatch(text, 'next week')
        if (nextWeekMatch !== null) {
                return addTimeToDate(text, getDateFromInterval(calculateDayInterval('nextWeek')), nextWeekMatch)
        }
        const nextMonthMatch = findDateExprMatch(text, 'next month')
        if (nextMonthMatch !== null) {
                const date: Date = new Date()
                date.setDate(1)
                date.setMonth(date.getMonth() + 1)
                date.setHours(calculateNearestHours(date))
                date.setMinutes(0)
                date.setSeconds(0)

                return addTimeToDate(text, date, nextMonthMatch)
        }
        const endOfMonthMatch = findDateExprMatch(text, 'end of month')
        if (endOfMonthMatch !== null) {
                const curDate: Date = new Date()
                const date: Date = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 0)
                date.setHours(calculateNearestHours(date))
                date.setMinutes(0)
                date.setSeconds(0)

                return addTimeToDate(text, date, endOfMonthMatch)
        }

	let parsed = getDateFromWeekday(text, now)
	if (parsed.date !== null) {
		return addTimeToDate(text, parsed.date, parsed.foundText)
	}

	parsed = getDayFromText(text, now)
	if (parsed.date !== null) {
		const month = getMonthFromText(text, parsed.date)
		return addTimeToDate(month.newText, month.date, parsed.foundText)
	}

	parsed = getDateFromTextIn(text, now)
	if (parsed.date !== null) {
		return addTimeToDate(text, parsed.date, parsed.foundText)
	}

	parsed = getDateFromText(text, now)

	if (parsed.date === null) {
		const time = addTimeToDate(text, new Date(now), parsed.foundText)

		if (time.date !== null && +now !== +time.date) {
			return time
		}

		return {
			newText: replaceAll(text, parsed.foundText, ''),
			date: parsed.date,
		}
	}

	return addTimeToDate(text, parsed.date, parsed.foundText)
}

const addTimeToDate = (text: string, date: Date, previousMatch: string | null): dateParseResult => {
	previousMatch = previousMatch?.trim() || ''
	text = replaceAll(text, previousMatch, '')
	if (previousMatch === null) {
		return {
			newText: text,
			date: null,
		}
	}

	const timeMatch = findTimeMatch(text)

	if (timeMatch !== null) {
		const normalizedTime = timeMatch.time.replace(/\s+/gu, '').toLocaleLowerCase()
		const timeParts = /^([0-9]{1,2})(?::([0-9]{2}))?([ap]m)?$/.exec(normalizedTime)

		if (timeParts !== null) {
			let hours = parseInt(timeParts[1])
			const minutes = timeParts[2] ? parseInt(timeParts[2]) : 0
			const meridiem = timeParts[3]

			if (meridiem === 'pm' && hours !== 12) {
				hours += 12
			} else if (meridiem === 'am' && hours === 12) {
				hours = 0
			}

			date.setHours(hours)
			date.setMinutes(minutes)
			date.setSeconds(0)
			date.setMilliseconds(0)
		}
	}

	const replace = timeMatch !== null ? timeMatch.matchText : previousMatch
	return {
		newText: replaceAll(text, replace, '').trim(),
		date,
	}
}

export const getDateFromText = (text: string, now: Date = new Date()) => {
	const dateRegexes: RegExp[] = [
		/(^| )(?<found>(?<month>[0-9][0-9]?)\/(?<day>[0-9][0-9]?)(\/(?<year>[0-9][0-9]([0-9][0-9])?))?)($| )/gi,
		/(^| )(?<found>(?<year>[0-9][0-9][0-9][0-9]?)\/(?<month>[0-9][0-9]?)\/(?<day>[0-9][0-9]))($| )/gi,
		/(^| )(?<found>(?<year>[0-9][0-9][0-9][0-9]?)-(?<month>[0-9][0-9]?)-(?<day>[0-9][0-9]))($| )/gi,
		/(^| )(?<found>(?<day>[0-9][0-9]?)\.(?<month>[0-9][0-9]?)(\.(?<year>[0-9][0-9]([0-9][0-9])?))?)($| )/gi,
	]

	let result: string | null = null
	let results: RegExpExecArray | null = null
	let foundText: string | null = ''
	let containsYear = true

	// 1. Try parsing the text as a "usual" date, like 2021-06-24 or "06/24/2021" or "27/01" or "01/27"
	for (const dateRegex of dateRegexes) {
		results = dateRegex.exec(text)
		if (results !== null) {
			const {day, month, year, found} = {...results.groups}
			let tmp_year = year

			if (tmp_year === undefined) {
				tmp_year = year ?? now.getFullYear()
				containsYear = false
			}

			result = `${month}/${day}/${tmp_year}`
			result = !isNaN(new Date(result).getTime()) ? result : `${day}/${month}/${tmp_year}`
			result = !isNaN(new Date(result).getTime()) ? result : null
			
			if(result !== null){
				foundText = found
				break
			}
		}
	}

	// 2. Try parsing the date as something like "jan 21" or "21 jan"
	if (result === null) {
		const monthRegex = new RegExp(`(^| )(${monthsRegexGroup} [0-9][0-9]?|[0-9][0-9]? ${monthsRegexGroup})`, 'ig')
		results = monthRegex.exec(text)
		result = results === null ? null : `${results[0]} ${now.getFullYear()}`.trim()
		foundText = results === null ? '' : results[0].trim()
		containsYear = false
	}
	
	if (result === null) {
		return {
			foundText,
			date: null,
		}
	}

	const date = new Date(result)
	if (isNaN(date.getTime())) {
		return {
			foundText,
			date: null,
		}
	}

	if (!containsYear && date < now) {
		date.setFullYear(date.getFullYear() + 1)
	}

	return {
		foundText,
		date,
	}
}

export const getDateFromTextIn = (text: string, now: Date = new Date()) => {
	const regex = /(in [0-9]+ (hours?|days?|weeks?|months?))/ig
	const results = regex.exec(text)
	if (results === null) {
		return {
			foundText: '',
			date: null,
		}
	}

	const foundText: string = results[0]
	const date = new Date(now)
	const parts = foundText.split(' ')
	switch (parts[2]) {
		case 'hours':
		case 'hour':
			date.setHours(date.getHours() + parseInt(parts[1]))
			break
		case 'days':
		case 'day':
			date.setDate(date.getDate() + parseInt(parts[1]))
			break
		case 'weeks':
		case 'week':
			date.setDate(date.getDate() + parseInt(parts[1]) * 7)
			break
		case 'months':
		case 'month':
			date.setMonth(date.getMonth() + parseInt(parts[1]))
			break
	}

	return {
		foundText,
		date,
	}
}

const getDateFromWeekday = (text: string, date: Date = new Date()): dateFoundResult => {
	const matcher = /(^| )(next )?(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)($| )/g
	const results: string[] | null = matcher.exec(text.toLowerCase()) // The i modifier does not seem to work.
	if (results === null) {
		return {
			foundText: null,
			date: null,
		}
	}

	const currentDay: number = date.getDay()
	let day = 0

	switch (results[3]) {
		case 'mon':
		case 'monday':
			day = 1
			break
		case 'tue':
		case 'tuesday':
			day = 2
			break
		case 'wed':
		case 'wednesday':
			day = 3
			break
		case 'thu':
		case 'thursday':
			day = 4
			break
		case 'fri':
		case 'friday':
			day = 5
			break
		case 'sat':
		case 'saturday':
			day = 6
			break
		case 'sun':
		case 'sunday':
			day = 0
			break
		default:
			return {
				foundText: null,
				date: null,
			}
	}

	const distance: number = (day + 7 - currentDay) % 7
	date.setDate(date.getDate() + distance)

	// This a space at the end of the found text to not break parsing suffix strings like "at 14:00" in cases where the 
	// matched string comes with a space at the end (last part of the regex).
	let foundText = results[0]
	if (foundText.endsWith(' ')) {
		foundText = foundText.slice(0, foundText.length - 1)
	}

	return {
		foundText: foundText,
		date: date,
	}
}

const getDayFromText = (text: string, now: Date = new Date()) => {
	const matcher = /(^| )(([1-2][0-9])|(3[01])|(0?[1-9]))(st|nd|rd|th|\.)($| )/ig
	const results = matcher.exec(text)
	if (results === null) {
		return {
			foundText: null,
			date: null,
		}
	}

	const date = new Date(now)
	const day = parseInt(results[0])
	date.setDate(day)

	// If the parsed day is the 31st (or 29+ and the next month is february) but the next month only has 30 days, 
	// setting the day to 31 will "overflow" the date to the next month, but the first.
	// This would look like a very weired bug. Now, to prevent that, we check if the day is the same as parsed after 
	// setting it for the first time and set it again if it isn't - that would mean the month overflowed.
	while (date < now) {
		date.setMonth(date.getMonth() + 1)
	}

	if (date.getDate() !== day) {
		date.setDate(day)
	}

	return {
		foundText: results[0],
		date: date,
	}
}

const getMonthFromText = (text: string, date: Date) => {
	const matcher = new RegExp(monthsRegexGroup, 'ig')
	const results = matcher.exec(text)

	if (results === null) {
		return {
			newText: text,
			date,
		}
	}

	const fullDate = new Date(`${results[0]} 1 ${(new Date()).getFullYear()}`)
	date.setMonth(fullDate.getMonth())
	return {
		newText: replaceAll(text, results[0], ''),
		date,
	}
}

const getDateFromInterval = (interval: number): Date => {
	const newDate = new Date()
	newDate.setDate(newDate.getDate() + interval)
	newDate.setHours(calculateNearestHours(newDate), 0, 0)

	return newDate
}
