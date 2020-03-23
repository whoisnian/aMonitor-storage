import { URL } from 'url'
import { logger } from '../module/logger'
import WebSocket from 'ws'

const wsServer = new WebSocket.Server({ noServer: true })

wsServer.on('connection', (ws) => {
  console.log('connected')
  ws.on('message', (message) => {
    console.log('received: %s', message)
    ws.send(`${message} received`)
  })
  ws.send('success')
})

const wsRouter = (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const pathname = url.pathname
  logger.info(pathname)
  if (pathname === '/ws') {
    wsServer.handleUpgrade(request, socket, head, function done (ws) {
      wsServer.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
}

export { wsRouter }
