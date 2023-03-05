// @ts-nocheck
const DB_NAME = 'fileStore'
const OBJECT_STORE_NAME = 'fileStore'

function openDatabasePromise(keyPath) {
  return new Promise((resolve, reject) => {
    const dbOpenRequest = window.indexedDB.open(DB_NAME, '1')

    dbOpenRequest.onblocked = () => {
      reject('db block error')
    }

    dbOpenRequest.onerror = (err) => {
      console.log('Unable to open indexedDB ' + DB_NAME)
      console.log(err)
      reject(err.message)
    }

    dbOpenRequest.onupgradeneeded = (event) => {
      const db = event.target.result
      try {
        db.deleteObjectStore(OBJECT_STORE_NAME)
      } catch (err) {
        console.log(err)
      }
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath })
    }

    dbOpenRequest.onsuccess = () => {
      console.info('Successfully open indexedDB connection to ' + DB_NAME)
      resolve(dbOpenRequest.result)
    }

    dbOpenRequest.onerror = reject
  })
}

function wrap(methodName) {
  return function () {
    const [objectStore, ...etc] = arguments
    return new Promise((resolve, reject) => {
      const request = objectStore[methodName](...etc)
      request.onsuccess = () => resolve(request.result)
      request.onerror = reject
    })
  }
}
const deletePromise = wrap('delete')
const getAllPromise = wrap('getAll')
const getPromise = wrap('get')
const putPromise = wrap('put')

export default class IndexedDbRepository {
  /* ... */
  constructor(keyPath) {
    this.error = null
    this.keyPath = keyPath

    this.openDatabasePromise = this._openDatabase()
  }

  async _openDatabase(keyPath) {
    try {
      this.dbConnection = await openDatabasePromise(keyPath)
    } catch (error) {
      this.error = error
      throw error
    }
  }

  async _tx(txMode, callback) {
    await this.openDatabasePromise // await db connection
    const transaction = this.dbConnection.transaction([OBJECT_STORE_NAME], txMode)
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME)
    return await callback(objectStore)
  }

  async findAll() {
    return this._tx('readonly', (objectStore) => getAllPromise(objectStore))
  }

  async findById(key) {
    return this._tx('readonly', (objectStore) => getPromise(objectStore, key))
  }

  async deleteById(key) {
    return this._tx('readwrite', (objectStore) => deletePromise(objectStore, key))
  }

  async save(item) {
    return this._tx('readwrite', (objectStore) => putPromise(objectStore, item))
  }
}
