import {describe, it, expect} from 'vitest'
import {createNewIndexer} from '../index'

interface Item { id: number; title: string }


describe('Fuse indexer', () => {
  it('should add and search items', () => {
    const {add, search} = createNewIndexer<Item>('test-add', ['title'])
    add({id: 1, title: 'hello'})
    add({id: 2, title: 'world'})

    expect(search('hello')).toEqual([1])
  })

  it('should update items', () => {
    const {add, update, search} = createNewIndexer<Item>('test-update', ['title'])
    add({id: 1, title: 'hello'})
    update({id: 1, title: 'hell'})
    expect(search('hell')).toContain(1)
  })

  it('should remove items', () => {
    const {add, remove, search} = createNewIndexer<Item>('test-remove', ['title'])
    add({id: 1, title: 'hello'})
    remove({id: 1, title: 'hello'})
    expect(search('hello')).not.toContain(1)
  })
})
