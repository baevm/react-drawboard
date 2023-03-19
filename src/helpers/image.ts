import { db } from '@/utils/indexdb'
import memoize from 'fast-memoize'

export const loadSavedImage = async (id: string) => {
  const base64Image = await getImageFromDb(id)

  return loadHTMLImage(base64Image)
}

export const getMemoizedImage = memoize(loadSavedImage)

export function loadHTMLImage(base64Image: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.src = base64Image

    console.log(image.width, image.height)

    image.onload = () => {
      resolve(image)
    }

    image.onerror = (error) => {
      reject(error)
    }
  })
}

const getImageFromDb = async (id: string) => {
  const res = await db.files.where('id').equals(id).first()

  return res?.dataURL
}
