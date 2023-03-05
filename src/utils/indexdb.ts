import Dexie, { Table } from 'dexie'

export interface File {
  id?: string
  file: any
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  files!: Table<File>

  constructor() {
    super('fileStore')
    this.version(1).stores({
      files: '++id', // Primary key and indexed props
    })
  }
}

export const db = new MySubClassedDexie()
