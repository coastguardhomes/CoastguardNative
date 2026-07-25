export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function load(key, fallback = null) {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : fallback
}

export function remove(key) {
  localStorage.removeItem(key)
}
