import { useState, useEffect, useMemo } from 'react'
import { loadTasks, saveTasks } from '../utils/storage'

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 }

export function useTasks() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [filters, setFilters] = useState({
    status: 'not_done',
    priority: 'all',
    tag: 'all',
    overdueOnly: false,
  })
  const [sortKey, setSortKey] = useState('dueDate_asc')

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

  function importTasks(imported) {
    setTasks(imported)
  }

  const today = new Date().toISOString().slice(0, 10)

  const allTags = useMemo(() => {
    const tagSet = new Set()
    tasks.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (filters.status === 'not_done') {
      result = result.filter((t) => t.status !== 'done')
    } else if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status)
    }
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority)
    }
    if (filters.tag !== 'all') {
      result = result.filter((t) => (t.tags || []).includes(filters.tag))
    }
    if (filters.overdueOnly) {
      result = result.filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== 'done'
      )
    }

    return [...result].sort((a, b) => {
      if (sortKey === 'dueDate_asc')
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
      if (sortKey === 'dueDate_desc')
        return (b.dueDate || '').localeCompare(a.dueDate || '')
      if (sortKey === 'priority')
        return (PRIORITY_ORDER[a.priority] || 99) - (PRIORITY_ORDER[b.priority] || 99)
      if (sortKey === 'createdAt')
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      return 0
    })
  }, [tasks, filters, sortKey, today])

  return {
    tasks,
    filteredTasks,
    allTags,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    addTagToTasks,
    removeTagFromTasks,
    importTasks,
  }
}
