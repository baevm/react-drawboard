import { INDEXDB_NAME } from '@/constants'
import Dexie, { Table } from 'dexie'

export interface File {
  id?: string
  dataURL: any
}

export class MySubClassedDexie extends Dexie {
  files!: Table<File>

  constructor() {
    super(INDEXDB_NAME)
    this.version(1).stores({
      files: '++id', // Primary key and indexed props
    })
  }
}

export const db = new MySubClassedDexie()
