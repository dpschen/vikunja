import {beforeEach, test, expect} from 'vitest'
import {projectHistory, saveProjectToHistory, removeProjectFromHistory} from './projectHistory'

beforeEach(() => {
        projectHistory.value = []
})

test('return an empty history when none was saved', () => {
        expect(projectHistory.value).toStrictEqual([])
})

test('return a saved history', () => {
        projectHistory.value = [{id: 1}, {id: 2}]
        expect(projectHistory.value).toStrictEqual([{id: 1}, {id: 2}])
})

test('store project in history', () => {
        saveProjectToHistory({id: 1})
        expect(projectHistory.value).toStrictEqual([{id: 1}])
})

test('store only the last 6 projects in history', () => {
        saveProjectToHistory({id: 1})
        saveProjectToHistory({id: 2})
        saveProjectToHistory({id: 3})
        saveProjectToHistory({id: 4})
        saveProjectToHistory({id: 5})
        saveProjectToHistory({id: 6})
        saveProjectToHistory({id: 7})
        expect(projectHistory.value).toStrictEqual([
                {id: 7}, {id: 6}, {id: 5}, {id: 4}, {id: 3}, {id: 2},
        ])
})

test("don't store the same project twice", () => {
        saveProjectToHistory({id: 1})
        saveProjectToHistory({id: 1})
        expect(projectHistory.value).toStrictEqual([{id: 1}])
})

test('move a project to the beginning when storing it multiple times', () => {
        saveProjectToHistory({id: 1})
        saveProjectToHistory({id: 2})
        saveProjectToHistory({id: 1})
        expect(projectHistory.value).toStrictEqual([{id: 1}, {id: 2}])
})

test('remove project from history', () => {
        saveProjectToHistory({id: 1})
        removeProjectFromHistory({id: 1})
        expect(projectHistory.value).toStrictEqual([])
})
