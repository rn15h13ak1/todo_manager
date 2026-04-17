import { generateTimestamp } from './date'
import { downloadFile } from './download'

export function exportJson(tasks) {
  const json = JSON.stringify(tasks, null, 2)
  downloadFile(json, `todo-manager_${generateTimestamp()}.json`, 'application/json;charset=utf-8')
}
