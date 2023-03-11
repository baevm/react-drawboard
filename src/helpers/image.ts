import { db } from '@/utils/indexdb'
import { memoize } from '@/utils/memoize'

export const loadSavedImage = memoize(async (id: string) => {
  const res = await db.files.where('id').equals(id).first()

  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.onerror = () => {
      reject(image)
    }

    image.src = res?.dataURL
  })
})

export const getMemoizedImage: (v: string) => Promise<any> = memoize(loadSavedImage)
