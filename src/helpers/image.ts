import { db } from '@/utils/indexdb'
import memoize from 'fast-memoize'

export const loadSavedHTMLImage = async (id: string) => {
  const base64Image = await getImageFromDb(id)

  return loadHTMLImage(base64Image)
}

export const getMemoizedHTMLImage = memoize(loadSavedHTMLImage)

export function loadHTMLImage(base64Image: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.onerror = (error) => {
      reject(error)
    }

    image.src = base64Image
  })
}

export const saveImageToDb = async ({ id, dataURL }: { id: string; dataURL: string }) => {
  const res = await db.files.add({ id, dataURL })

  return res
}

export const getImageFromDb = async (id: string) => {
  const res = await db.files.where('id').equals(id).first()

  return res?.dataURL
}

export const resetImagesFromDb = async () => {
  return db.files.clear()
}
