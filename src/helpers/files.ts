import { fileOpen, FileWithHandle, fileSave } from 'browser-fs-access'

export async function openBase64File() {
  const blob = await fileOpen({
    mimeTypes: ['image/*'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
  }).catch((e) => console.error(e))

  if (!blob) return

  const base64File = await readFileAsUrl(blob)

  return base64File
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

  console.log(savedFile)
  return
}

export function readFileAsText(file: FileWithHandle) {
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

export function readFileAsUrl(file: FileWithHandle) {
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
