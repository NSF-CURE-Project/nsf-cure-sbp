import { describe, expect, it } from 'vitest'
import {
  moveBetweenArrays,
  parseDragId,
  reindexByOrder,
  reorderInArray,
} from '@/views/courses/reorder-utils'
import type { DragEntityType } from '@/views/courses/types'

describe('course reorder utils', () => {
  it('reorders items within same array', () => {
    expect(reorderInArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })

  it('moves item between arrays', () => {
    const result = moveBetweenArrays(['a', 'b'], ['x'], 1, 1)
    expect(result.source).toEqual(['a'])
    expect(result.target).toEqual(['x', 'b'])
  })

  it('reindexes order fields', () => {
    const items = reindexByOrder(
      [
        { id: 'l1', order: 4 },
        { id: 'l2', order: 1 },
      ],
      'order',
    )
    expect(items.map((item) => item.order)).toEqual([1, 2])
  })

  it('parses valid drag ids', () => {
    const types: DragEntityType[] = ['course', 'chapter', 'lesson', 'chapter-lessons']
    types.forEach((type) => {
      expect(parseDragId(`${type}:abc`)).toEqual({ type, id: 'abc' })
    })
  })

  it('returns null for invalid drag ids', () => {
    expect(parseDragId('')).toBeNull()
    expect(parseDragId('missing-separator')).toBeNull()
    expect(parseDragId('unknown:abc')).toBeNull()
    expect(parseDragId('lesson:')).toBeNull()
  })
})
