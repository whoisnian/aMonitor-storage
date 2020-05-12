import { URL } from 'url'
import { Server as WebSocketServer } from 'ws'
import { logger } from '../module/logger'
import {
  getAgentIDbyToken,
  updateBasicInfo,
  updateAgentStatusbyID,
  updateIPAddress,
  insertCpuInfo,
  insertMemInfo,
  insertLoadInfo,
  insertNetInfo,
  insertDiskInfo,
  insertMountsInfo,
  insertSshdInfo,
  insertFileMDInfo,
  getRulesbyAgentID
} from '../module/storage'
import { analyzer } from '../module/analyzer'
import { sendMessage } from '../module/sender'
import { getClientIP } from '../module/util'

// 报警规则存储器
const rules = {}

const wsServer = new WebSocketServer({ noServer: true })

wsServer.on('connection', (ws, req) => {
  logger.info('Agent ' + req.from + ' start websocket connection.')
  ws.on('close', () => {
    logger.info('Agent ' + req.from + ' close websocket connection.')
    updateAgentStatusbyID('off', req.from)
  })

  ws.on('message', (message) => {
    const packet = JSON.parse(message)
    switch (packet.Category) {
      case 'basicInfo':
        updateBasicInfo(packet, req.from)
        updateIPAddress(getClientIP(req), req.from)
        break
      case 'cpuInfo':
        insertCpuInfo(packet, req.from)
        if (rules[req.from].cpu) {
          rules[req.from].cpu.forEach(async (cpurule, index) => {
            if (Date.now() > cpurule.trigger_time + cpurule.silent) { // 非静默区间
              const { checked, content } = await analyzer.cpu[cpurule.event](req.from, cpurule)
              if (checked) { // 满足报警条件
                rules[req.from].cpu[index].trigger_time = Date.now()
                sendMessage(content, req.from, cpurule)
              }
            }
          })
        }
        break
      case 'memInfo':
        insertMemInfo(packet, req.from)
        if (rules[req.from].mem) {
          rules[req.from].mem.forEach(async (memrule, index) => {
            if (Date.now() > memrule.trigger_time + memrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.mem[memrule.event](req.from, memrule)
              if (checked) { // 满足报警条件
                rules[req.from].mem[index].trigger_time = Date.now()
                sendMessage(content, req.from, memrule)
              }
            }
          })
        }
        break
      case 'loadInfo':
        insertLoadInfo(packet, req.from)
        if (rules[req.from].load) {
          rules[req.from].load.forEach(async (loadrule, index) => {
            if (Date.now() > loadrule.trigger_time + loadrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.load[loadrule.event](req.from, loadrule, packet)
              if (checked) { // 满足报警条件
                rules[req.from].load[index].trigger_time = Date.now()
                sendMessage(content, req.from, loadrule)
              }
            }
          })
        }
        break
      case 'netInfo':
        insertNetInfo(packet, req.from)
        if (rules[req.from].net) {
          rules[req.from].net.forEach(async (netrule, index) => {
            if (Date.now() > netrule.trigger_time + netrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.net[netrule.event](req.from, netrule)
              if (checked) { // 满足报警条件
                rules[req.from].net[index].trigger_time = Date.now()
                sendMessage(content, req.from, netrule)
              }
            }
          })
        }
        break
      case 'diskInfo':
        insertDiskInfo(packet, req.from)
        if (rules[req.from].disk) {
          rules[req.from].disk.forEach(async (diskrule, index) => {
            if (Date.now() > diskrule.trigger_time + diskrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.disk[diskrule.event](req.from, diskrule)
              if (checked) { // 满足报警条件
                rules[req.from].disk[index].trigger_time = Date.now()
                sendMessage(content, req.from, diskrule)
              }
            }
          })
        }
        break
      case 'mountsInfo':
        insertMountsInfo(packet, req.from)
        if (rules[req.from].mount) {
          rules[req.from].mount.forEach(async (mountrule, index) => {
            if (Date.now() > mountrule.trigger_time + mountrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.mount[mountrule.event](req.from, mountrule, packet)
              if (checked) { // 满足报警条件
                rules[req.from].mount[index].trigger_time = Date.now()
                sendMessage(content, req.from, mountrule)
              }
            }
          })
        }
        break
      case 'sshdInfo':
        insertSshdInfo(packet, req.from)
        if (rules[req.from].sshd) {
          rules[req.from].sshd.forEach(async (sshdrule, index) => {
            if (Date.now() > sshdrule.trigger_time + sshdrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.sshd[sshdrule.event](req.from, sshdrule, packet)
              if (checked) { // 满足报警条件
                rules[req.from].sshd[index].trigger_time = Date.now()
                sendMessage(content, req.from, sshdrule)
              }
            }
          })
        }
        break
      case 'fileMDInfo':
        insertFileMDInfo(packet, req.from)
        if (rules[req.from].filemd) {
          rules[req.from].filemd.forEach(async (filemdrule, index) => {
            if (Date.now() > filemdrule.trigger_time + filemdrule.silent) { // 非静默区间
              const { checked, content } = await analyzer.filemd[filemdrule.event](req.from, filemdrule, packet)
              if (checked) { // 满足报警条件
                rules[req.from].filemd[index].trigger_time = Date.now()
                sendMessage(content, req.from, filemdrule)
              }
            }
          })
        }
        break
    }
  })
})

const wsRouter = async (request, socket, head) => {
  // 检查路由
  const url = new URL(request.url, `http://${request.headers.host}`)
  const pathname = url.pathname
  if (pathname !== '/ws') {
    socket.destroy()
    return
  }

  // 检查token
  request.from = -1
  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    request.from = await getAgentIDbyToken(request.headers.authorization.split(' ')[1])
  }
  if (request.from === -1) {
    socket.destroy()
    return
  }

  // 加载报警规则
  const rs = await getRulesbyAgentID(request.from)
  rules[request.from] = {}
  rs && rs.forEach((r) => {
    if (!rules[request.from][r.target]) rules[request.from][r.target] = []
    rules[request.from][r.target].push({
      id: r.id,
      name: r.name,
      event: r.event,
      threshold: r.threshold,
      interval: r.interval,
      silent: r.silent,
      level: r.level,
      group_id: r.group_id,
      trigger_time: 0
    })
  })

  // 建立连接
  wsServer.handleUpgrade(request, socket, head, function done (ws) {
    wsServer.emit('connection', ws, request)
  })
}

export { wsRouter }
