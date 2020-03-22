const { readFileSync } = require('fs')
const { resolve } = require('path')
const { Client } = require('pg')

const DB_HOST = '127.0.0.1'
const DB_PORT = 5432
const DB_NAME = 'amonitor'
const DB_USER = 'postgres'
const DB_PASS = 'password'

const runMain = async function () {
  // https://www.postgresql.org/docs/current/app-initdb.html
  // The `postgres` database is a default database meant for use by users, utilities and third party applications.
  let client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres',
    user: DB_USER,
    password: DB_PASS
  })

  client.connect()

  let res = await client.query(`SELECT FROM pg_database WHERE datname = '${DB_NAME}';`)
  if (res.rowCount === 0) {
    // create database if not exists
    await client.query(`CREATE DATABASE ${DB_NAME}`)
    console.log(`create database '${DB_NAME}'`)
  } else {
    console.warn(`database '${DB_NAME}' exists`)
    process.exit(-1)
  }
  client.end()

  client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS
  })

  client.connect()

  const schemaPath = resolve(__dirname, './schema.sql')
  res = await client.query(readFileSync(schemaPath).toString())
  console.log(`finish ${res.length} queries`)

  client.end()
}

runMain()
