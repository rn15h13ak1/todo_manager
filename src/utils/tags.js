const TAG_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-cyan-100 text-cyan-700',
]

export function tagColor(tag) {
  let hash = 0
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return TAG_COLORS[hash % TAG_COLORS.length]
}
