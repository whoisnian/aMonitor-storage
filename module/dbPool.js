import { Pool } from 'pg'
import { config } from './config'
import { logger } from './logger'
import { getSQL } from './util'

let _dbPool

const initPool = async () => {
  // 若已初始化过，则不需再次初始化
  if (_dbPool) {
    logger.warn('Trying to init DB Pool again!')
    return
  }

  // 初始化数据库连接池
  _dbPool = new Pool({
    user: config.postgresql.user,
    host: config.postgresql.host,
    database: config.postgresql.dbname,
    password: config.postgresql.pass,
    port: config.postgresql.port,
    max: config.postgresql.max
  })

  // 通过执行查询测试能否连接上数据库
  await _dbPool.query('SELECT NOW()')
    .then(
      logger.info('DB Pool initialized.')
    ).catch(err => {
      logger.error(`DB Pool Error: ${err.message}`)
      process.exit(-1)
    })
}

const poolQuery = (text, params) => {
  if (!_dbPool) throw new Error('DB Pool has not been initialized. Please call init first.')
  config.debug && logger.plain('\x1b[1;36m' + getSQL(text, params) + '\x1b[0m')
  return _dbPool.query(text, params)
}

export { initPool, poolQuery }
