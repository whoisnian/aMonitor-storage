import expressSession from 'express-session'
import createRedisStore from 'connect-redis'
import { createClient } from 'redis'
import { config } from './config'
import { logger } from './logger'

const initSession = async () => {
  const RedisStore = createRedisStore(expressSession)

  let redisClient
  await new Promise((resolve, reject) => {
    // https://github.com/NodeRedis/node-redis#options-object-properties
    // [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
    redisClient = createClient({ url: config.redis.url })

    redisClient.on('error', err => reject(err))
    redisClient.on('connect', () => resolve())
  }).catch(err => {
    logger.error(`Redis Error: ${err}`)
    process.exit(-1)
  })

  return expressSession({
    name: 'amonitor_session',
    store: new RedisStore({ client: redisClient }),
    secret: config.secret,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 604800000 } // 过期时间一周
  })
}

export { initSession }
