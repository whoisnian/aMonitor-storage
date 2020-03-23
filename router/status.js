import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from '../module/config'

const packageJSON = JSON.parse(readFileSync(resolve(__dirname, '../package.json')).toString())

const oneMinute = 60000
const _reqLast5Minutes = {
  nowIndex: 0,
  reqPerMinute: [
    { t: 0, c: 0 },
    { t: 0, c: 0 },
    { t: 0, c: 0 },
    { t: 0, c: 0 },
    { t: 0, c: 0 }
  ]
}

const packageName = packageJSON.name
const packageVersion = packageJSON.version
const pid = process.pid
const baseUrl = 'http://' + config.server.host + ':' + config.server.port

const statusRouter = async (req, res) => {
  res.json({
    reqLast5Minutes: _reqLast5Minutes.reqPerMinute.reduce((last, cur) => {
      if (Math.floor(Date.now() / oneMinute) - cur.t < 5) {
        return last + cur.c
      }
      return last
    }, 0),
    package: {
      name: packageName,
      version: packageVersion,
      pid: pid,
      baseUrl: baseUrl
    }
  })
}

const updateStatus = (date) => {
  const time = date.getTime()
  if (Math.floor(time / oneMinute) === _reqLast5Minutes.reqPerMinute[_reqLast5Minutes.nowIndex].t) {
    _reqLast5Minutes.reqPerMinute[_reqLast5Minutes.nowIndex].c++
  } else {
    _reqLast5Minutes.nowIndex = _reqLast5Minutes.nowIndex === 4 ? 0 : _reqLast5Minutes.nowIndex + 1
    _reqLast5Minutes.reqPerMinute[_reqLast5Minutes.nowIndex].t = Math.floor(time / oneMinute)
    _reqLast5Minutes.reqPerMinute[_reqLast5Minutes.nowIndex].c = 1
  }
}

export { statusRouter, updateStatus }
