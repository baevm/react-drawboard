import { fileOpen, FileWithHandle, fileSave } from 'browser-fs-access'
import Compressor from 'compressorjs'

export async function openBase64File() {
  let blob = await fileOpen({
    mimeTypes: ['image/*'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
  }).catch((e) => console.error(e))

  if (!blob) return

  const resizedImage = await compress(blob)

  const base64File = await readFileAsUrl(resizedImage)

  return base64File
}

function compress(file: any): Promise<File | Blob> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 1000,
      success: resolve,
      error: reject,
      convertTypes: ['image/png', 'image/webp'],
      convertSize: 50000, // if png or webp size is more than 50000 convert to jpeg and resize
    })
  })
}

export async function openJsonFile() {
  const blob = await fileOpen({
    mimeTypes: ['application/json'],
    extensions: ['.json'],
  }).catch((e) => console.error(e))

  if (!blob) return

  const base64File = await readFileAsText(blob)

  return base64File
}

export async function saveAsJson(json: any) {
  const blob = new Blob([json], { type: 'application/json' })

  const savedFile = await fileSave(blob, { fileName: 'test', extensions: ['.json'], mimeTypes: ['application/json'] })

  return
}

function readFileAsText(file: FileWithHandle): Promise<string | ArrayBuffer | null> {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader()

    fr.readAsText(file)

    fr.onload = function () {
      resolve(fr.result)
    }

    fr.onerror = function () {
      reject(fr)
    }
  })
}

function readFileAsUrl(file: File | Blob): Promise<string | ArrayBuffer | null> {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader()

    fr.readAsDataURL(file)

    fr.onload = function () {
      resolve(fr.result)
    }

    fr.onerror = function () {
      reject(fr)
    }
  })
}
