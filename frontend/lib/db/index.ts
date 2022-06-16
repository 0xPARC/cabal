import JSONDB from './json'
import { DB } from './types'

// Choose which DB implementation to use
let DBImpl = JSONDB

let db: DB

declare global {
  var __db: DB | undefined
}

const path = '/tmp/db.json'
console.log(`Running db at path: ${path}`)
if (false) {
  db = new DBImpl({ path: LMDB_PATH })
} else {
  if (!global.__db) {
    global.__db = new DBImpl(path)
  }
  db = global.__db
}

export default db
