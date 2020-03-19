import http from 'http'
import express from 'express'
import WebSocket from 'ws'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws) {
  console.log('connected')
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
    ws.send(`${message} received`)
  })
  ws.send('success')
})

server.listen(3000, () => {
  console.log(`Server(pid: ${process.pid}) running at http://127.0.0.1:3000/`)
})
