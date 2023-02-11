import { nanoid } from 'nanoid'

export const generateId = (length = 11) => {
  return nanoid(length)
}
