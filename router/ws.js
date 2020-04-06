import { URL } from 'url'
import { Server as WebSocketServer } from 'ws'
import { logger } from '../module/logger'
import {
  getAgentIDbyToken,
  updateBasicInfo,
  insertCpuInfo,
  insertMemInfo,
  insertLoadInfo,
  insertNetInfo,
  insertDiskInfo,
  insertMountsInfo,
  insertSshdInfo,
  insertFileMDInfo
} from '../module/storage'

const wsServer = new WebSocketServer({ noServer: true })

wsServer.on('connection', (ws, req) => {
  logger.info('Agent ' + req.from + ' start websocket connection.')
  ws.on('close', () => {
    logger.info('Agent ' + req.from + ' close websocket connection.')
  })

  ws.on('message', (message) => {
    const packet = JSON.parse(message)
    switch (packet.Category) {
      case 'basicInfo':
        updateBasicInfo(packet, req.from)
        break
      case 'cpuInfo':
        insertCpuInfo(packet, req.from)
        break
      case 'memInfo':
        insertMemInfo(packet, req.from)
        break
      case 'loadInfo':
        insertLoadInfo(packet, req.from)
        break
      case 'netInfo':
        insertNetInfo(packet, req.from)
        break
      case 'diskInfo':
        insertDiskInfo(packet, req.from)
        break
      case 'mountsInfo':
        insertMountsInfo(packet, req.from)
        break
      case 'sshdInfo':
        insertSshdInfo(packet, req.from)
        break
      case 'fileMDInfo':
        insertFileMDInfo(packet, req.from)
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

  // 建立连接
  wsServer.handleUpgrade(request, socket, head, function done (ws) {
    wsServer.emit('connection', ws, request)
  })
}

export { wsRouter }
