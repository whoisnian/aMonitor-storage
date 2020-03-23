import express from 'express'
import { config } from './module/config'
import { logger } from './module/logger'
import { initPool } from './module/dbPool'
import { asyncRouter } from './module/util'
import { wsRouter } from './router/ws'
import { statusRouter, updateStatus } from './router/status'

const app = express()

const runServer = async () => {
  // 初始化数据库连接池
  await initPool()

  // 中间件：记录node收到的请求
  app.use(function (req, res, next) {
    // 到达时间
    req.arrival = new Date()
    // 来源用户
    req.from = -1
    // 重写res.end()，响应结束时打印日志
    config.debug && logger.reqTime(req, 'req load')
    const oldEnd = res.end
    res.end = (...args) => {
      config.debug && logger.reqTimeEnd(req, 'req load')
      logger.reqEnd(req, res.statusCode)
      oldEnd.apply(res, args)
    }
    // 更新/status页面访问统计
    updateStatus(req.arrival)
    next()
  })

  // 中间件：自动解析请求body中的json数据
  app.use(express.json())

  // 设置路由
  app.get('/status', asyncRouter(statusRouter))

  // 中间件：记录路由处理中预期之外的异常
  app.use((err, req, res, next) => {
    res.status(500).send({ error_type: 'INTERNAL_ERROR' })
    logger.error(err)
  })

  // 开启本地监听
  const server = app.listen(config.server.port, config.server.host, () => {
    logger.info(`Server(pid: ${process.pid}) running at http://${config.server.host}:${config.server.port}/`)
  })

  // 处理websocket连接
  server.on('upgrade', wsRouter)

  server.on('error', (err) => {
    logger.error(err)
    process.exit(-1)
  })
  return server
}

runServer()
