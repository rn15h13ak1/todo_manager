import { useState, useEffect, useMemo } from 'react'
import { loadTasks, saveTasks } from '../utils/storage'
import { getTodayString } from '../utils/date'
import { STATUS, FILTER_STATUS, SORT_KEY } from '../utils/constants'

// ソート用の重み（小さいほど優先度が高い）
const PRIORITY_SORT_WEIGHT = { high: 1, medium: 2, low: 3 }

export const INITIAL_FILTERS = {
  status: FILTER_STATUS.NOT_DONE,
  priority: FILTER_STATUS.ALL,
  tag: FILTER_STATUS.ALL,
  overdueOnly: false,
  searchText: '',
}
export const INITIAL_SORT_KEY = SORT_KEY.DUE_DATE_ASC

export function useTasks() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sortKey, setSortKey] = useState(INITIAL_SORT_KEY)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  function addTask(formData) {
    const task = {
      tags: [],
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, task])
  }

  function updateTask(id, updates) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function deleteTasks(ids) {
    const idSet = new Set(ids)
    setTasks((prev) => prev.filter((t) => !idSet.has(t.id)))
  }

  function addTagToTasks(ids, tag) {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) =>
        idSet.has(t.id) && !(t.tags || []).includes(tag)
          ? { ...t, tags: [...(t.tags || []), tag] }
          : t
      )
    )
  }

  function removeTagFromTasks(ids, tag) {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) =>
        idSet.has(t.id)
          ? { ...t, tags: (t.tags || []).filter((tg) => tg !== tag) }
          : t
      )
    )
  }

  function duplicateTask(task) {
    const newId = crypto.randomUUID()
    const copy = {
      ...task,
      id: newId,
      title: `${task.title} (コピー)`,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    return newId
  }

  function importTasks(imported) {
    setTasks(imported)
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setSortKey(INITIAL_SORT_KEY)
  }

  const today = getTodayString()

  const allTags = useMemo(() => {
    const tagSet = new Set()
    tasks.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (filters.status === FILTER_STATUS.NOT_DONE) {
      result = result.filter((t) => t.status !== STATUS.DONE)
    } else if (filters.status !== FILTER_STATUS.ALL) {
      result = result.filter((t) => t.status === filters.status)
    }
    if (filters.priority !== FILTER_STATUS.ALL) {
      result = result.filter((t) => t.priority === filters.priority)
    }
    if (filters.tag !== FILTER_STATUS.ALL) {
      result = result.filter((t) => (t.tags || []).includes(filters.tag))
    }
    if (filters.overdueOnly) {
      result = result.filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== STATUS.DONE
      )
    }
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      )
    }

    const byPriority = (a, b) =>
      (PRIORITY_SORT_WEIGHT[a.priority] || 99) - (PRIORITY_SORT_WEIGHT[b.priority] || 99)

    return [...result].sort((a, b) => {
      if (sortKey === SORT_KEY.DUE_DATE_ASC) {
        const d = (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
        return d !== 0 ? d : byPriority(a, b)
      }
      if (sortKey === SORT_KEY.DUE_DATE_DESC) {
        const d = (b.dueDate || '').localeCompare(a.dueDate || '')
        return d !== 0 ? d : byPriority(a, b)
      }
      if (sortKey === SORT_KEY.PRIORITY)
        return byPriority(a, b)
      if (sortKey === SORT_KEY.CREATED_AT)
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      return 0
    })
  }, [tasks, filters, sortKey, today])

  const isFiltered =
    filters.status !== INITIAL_FILTERS.status ||
    filters.priority !== INITIAL_FILTERS.priority ||
    filters.tag !== INITIAL_FILTERS.tag ||
    filters.overdueOnly !== INITIAL_FILTERS.overdueOnly ||
    filters.searchText !== INITIAL_FILTERS.searchText ||
    sortKey !== INITIAL_SORT_KEY

  return {
    tasks,
    filteredTasks,
    allTags,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    isFiltered,
    resetFilters,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    duplicateTask,
    addTagToTasks,
    removeTagFromTasks,
    importTasks,
  }
}
