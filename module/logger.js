import { getClientIP } from './util'

const logger = {}

const tag = {
  i: ' [I] ', // info message
  w: ' [W] ', // warn message
  e: ' [E] ', // error message
  r: ' [R] ' // request information
}

// module/config.js会调用该函数设置是否开启debug，debug模式下为日志增加ANSI Color
logger.setDebug = (debug) => {
  if (debug) {
    // 颜色：0(黑)、1(红)、2(绿)、 3(黄)、4(蓝)、5(洋红)、6(青)、7(白)
    tag.i = '\x1b[1;32m' + tag.i + '\x1b[0m'
    tag.w = '\x1b[1;33m' + tag.w + '\x1b[0m'
    tag.e = '\x1b[1;31m' + tag.e + '\x1b[0m'
    tag.r = '\x1b[1;34m' + tag.r + '\x1b[0m'
  }
}

// 可以在这里修改日志中的时间格式
function timeStr (time) {
  if (!time) time = new Date()
  return time.toISOString()
}

logger.info = (msg, time) => console.log(timeStr(time) + tag.i + msg)
logger.warn = (msg, time) => console.log(timeStr(time) + tag.w + msg)
logger.error = (msg, time) => console.log(timeStr(time) + tag.e + msg)
logger.plain = (msg, time) => console.log(timeStr(time) + ' ' + msg)

logger.sql = (msg, time) => console.log(timeStr(time) + ' ' + '\x1b[1;36m' + msg + '\x1b[0m')

// debug模式下记录请求耗时
logger.reqTime = function (req, msg) {
  console.time(timeStr(req.arrival) + ' ' + req.originalUrl + ' ' + msg)
}
logger.reqTimeEnd = function (req, msg) {
  console.timeEnd(timeStr(req.arrival) + ' ' + req.originalUrl + ' ' + msg)
}

// 请求结束时记录完整请求
logger.reqEnd = (req, status) => {
  console.log(timeStr(req.arrival) + tag.r + '[' +
    status + '] ' +
    getClientIP(req) + ' ' +
    req.from + ' ' +
    req.method + ' ' +
    req.originalUrl + ' ' +
    JSON.stringify(req.body)
  )
}

export { logger }
