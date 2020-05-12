import express from 'express'
import { config } from './module/config'
import { logger } from './module/logger'
import { initPool } from './module/dbPool'
import { initSession } from './module/session'
import { isNumber, asyncRouter, loginRequired } from './module/util'
import { wsRouter } from './router/ws'
import { registerRouter } from './router/register'
import { statusRouter, updateStatus } from './router/status'
import { signInRouter, signUpRouter, logoutRouter } from './router/auth'
import { selfRouter } from './router/user'
import { allAgentsRouter, agentStatusRouter, deleteAgentRouter, recoverAgentRouter, agentInfoRouter } from './router/agent'
import { dataRouter } from './router/data'
import { overviewRouter } from './router/overview'
import {
  createGroupRouter,
  createRuleRouter,
  updateRuleRouter,
  createAgentGroupRouter,
  allGroupsRouter,
  groupRulesRouter,
  groupAgentsRouter,
  agentRulesRouter,
  deleteGroupRouter,
  deleteRuleRouter,
  deleteAgentGroupRouter,
  groupRouter
} from './router/rule'
import {
  createReceiverRouter,
  allReceiversRouter,
  receiversRouter,
  deleteReceiverRouter,
  updateReceiverRouter,
  createReceiverGroupRouter,
  deleteReceiverGroupRouter
} from './router/receiver'
import {
  allMessagesRouter,
  agentMessagesRouter,
  deleteMessageRouter
} from './router/message'

const app = express()

const runServer = async () => {
  // 初始化数据库连接池
  await initPool()

  // 中间件：使用redis管理session
  const session = await initSession()
  app.use(session)

  // 中间件：记录node收到的请求
  app.use(function (req, res, next) {
    // 到达时间
    req.arrival = new Date()
    // 来源用户
    req.from = isNumber(req.session.userID) ? req.session.userID : -1
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

  // 中间件：自动解析请求body中的application/json数据
  app.use(express.json())
  // 中间件：自动解析请求body中的application/x-www-form-urlencoded数据
  app.use(express.urlencoded({ extended: true }))

  // 设置路由
  app.get('/status', asyncRouter(statusRouter))
  app.post('/register', asyncRouter(registerRouter))

  app.post('/api/signin', asyncRouter(signInRouter))
  app.post('/api/signup', asyncRouter(signUpRouter))
  app.post('/api/logout', asyncRouter(logoutRouter))

  app.get('/api/self', loginRequired, asyncRouter(selfRouter))
  app.get('/api/overview', loginRequired, asyncRouter(overviewRouter))

  app.get('/api/agents', loginRequired, asyncRouter(allAgentsRouter))
  app.delete('/api/agent/:agentID', loginRequired, asyncRouter(deleteAgentRouter))
  app.put('/api/agent/:agentID', loginRequired, asyncRouter(recoverAgentRouter))
  app.post('/api/agent/:agentID', loginRequired, asyncRouter(agentStatusRouter))
  app.get('/api/agent/:agentID', loginRequired, asyncRouter(agentInfoRouter))

  app.get('/api/data/:agentID/:category', loginRequired, asyncRouter(dataRouter))

  app.post('/api/group', loginRequired, asyncRouter(createGroupRouter))
  app.get('/api/group/:groupID', loginRequired, asyncRouter(groupRouter))
  app.post('/api/rule', loginRequired, asyncRouter(createRuleRouter))
  app.put('/api/rule/:ruleID', loginRequired, asyncRouter(updateRuleRouter))
  app.post('/api/agentgroup', loginRequired, asyncRouter(createAgentGroupRouter))
  app.get('/api/groups', loginRequired, asyncRouter(allGroupsRouter))
  app.get('/api/grouprules/:groupID', loginRequired, asyncRouter(groupRulesRouter))
  app.get('/api/groupagents/:groupID', loginRequired, asyncRouter(groupAgentsRouter))
  app.get('/api/agentrules/:agentID', loginRequired, asyncRouter(agentRulesRouter))
  app.delete('/api/group/:groupID', loginRequired, asyncRouter(deleteGroupRouter))
  app.delete('/api/rule/:ruleID', loginRequired, asyncRouter(deleteRuleRouter))
  app.delete('/api/agentgroup/:agentID/:groupID', loginRequired, asyncRouter(deleteAgentGroupRouter))

  app.post('/api/receiver', loginRequired, asyncRouter(createReceiverRouter))
  app.get('/api/receivers', loginRequired, asyncRouter(allReceiversRouter))
  app.get('/api/receivers/:groupID', loginRequired, asyncRouter(receiversRouter))
  app.delete('/api/receiver/:receiverID', loginRequired, asyncRouter(deleteReceiverRouter))
  app.put('/api/receiver/:receiverID', loginRequired, asyncRouter(updateReceiverRouter))
  app.post('/api/receivergroup', loginRequired, asyncRouter(createReceiverGroupRouter))
  app.delete('/api/receivergroup/:receiverID/:groupID', loginRequired, asyncRouter(deleteReceiverGroupRouter))

  app.get('/api/messages', loginRequired, asyncRouter(allMessagesRouter))
  app.get('/api/agentmessages/:agentID', loginRequired, asyncRouter(agentMessagesRouter))
  app.delete('/api/message/:messageID', loginRequired, asyncRouter(deleteMessageRouter))

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
