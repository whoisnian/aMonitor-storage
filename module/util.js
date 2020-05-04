import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto'

const asyncRouter = router => (req, res, next) =>
  Promise.resolve(router(req, res)).catch(next)

const loginRequired = (req, res, next) => {
  if (!isNumber(req.session.userID) || req.session.userID === -1) {
    res.status(401).send({ error_type: 'UNAUTHORIZED' })
  } else {
    next()
  }
}

const getSQL = (text, params) => {
  if (!params) return text
  return params.reduce((q, v, i) => {
    if (typeof v === 'number') {
      return q.replace(`$${i + 1}`, v)
    } else if (v instanceof Date) {
      return q.replace(`$${i + 1}`, 'to_timestamp(' + (v.getTime() / 1000) + ')')
    } else {
      return q.replace(`$${i + 1}`, '\'' + v + '\'')
    }
  }, text)
}

const getClientIP = (req) => {
  let ip = ''
  if (req.headers['x-nginx-proxy']) {
    ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'].split(',')[0].trim()
  }
  ip = ip || req.socket.remoteAddress

  return ip
}

const isString = (v) => { return typeof v === 'string' }
const isNumber = (v) => { return typeof v === 'number' }
const isHexString = (v) => { return /^[0-9A-F]+$/i.test(v) }

// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
const isEmptyObject = (v) => { return Object.keys(v).length === 0 && v.constructor === Object }

const tokenEncode = (raw, key) => {
  const iv = randomBytes(16)
  const cipher = createCipheriv('AES-256-CFB', key, iv)

  const buf1 = cipher.update(raw, 'hex')
  const buf2 = cipher.final()
  return Buffer.concat([iv, buf1, buf2]).toString('base64')
}

const tokenDecode = (raw, key) => {
  const buf = Buffer.from(raw, 'base64')

  const iv = buf.slice(0, 16)
  const encrypted = buf.slice(16)
  const decipher = createDecipheriv('AES-256-CFB', key, iv)

  const res1 = decipher.update(encrypted)
  const res2 = decipher.final()
  return Buffer.concat([res1, res2]).toString('hex')
}

const passwordHash = (raw, salt) => {
  const md5 = createHash('md5')
  md5.update(salt)
  md5.update(raw)
  return md5.digest('hex')
}

export {
  asyncRouter,
  loginRequired,
  getSQL,
  getClientIP,
  isString,
  isNumber,
  isHexString,
  isEmptyObject,
  tokenEncode,
  tokenDecode,
  passwordHash
}
