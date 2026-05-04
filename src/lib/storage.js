const parseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}
export const getStorage = (key) => parseJSON(localStorage.getItem(key))
export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}
export const removeStorage = (key) => {
  localStorage.removeItem(key)
}