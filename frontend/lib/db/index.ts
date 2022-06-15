import JSONDB from './json'
import { DB } from './types'

const db: DB = new JSONDB('/tmp/db.json')
export default db
