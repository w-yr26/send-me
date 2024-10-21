import knex from 'knex'
import 'dotenv/config'
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  },
})

export default db