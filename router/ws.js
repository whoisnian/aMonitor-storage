import { URL } from 'url'
import { logger } from '../module/logger'
import { getAgentIDbyToken, updateBasicInfo } from '../module/storage'
import { Server as WebSocketServer } from 'ws'

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
