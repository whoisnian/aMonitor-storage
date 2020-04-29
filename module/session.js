import expressSession from 'express-session'
import createRedisStore from 'connect-redis'
import { createClient } from 'redis'
import { config } from './config'

const session = () => {
  const RedisStore = createRedisStore(expressSession)

  // https://github.com/NodeRedis/node-redis#options-object-properties
  // [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
  const redisClient = createClient({ url: config.redis.url })

  return expressSession({
    store: new RedisStore({ client: redisClient }),
    secret: config.secret,
    saveUninitialized: false,
    resave: false
  })
}

export { session }
