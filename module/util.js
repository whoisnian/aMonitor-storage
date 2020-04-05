import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const asyncRouter = router => (req, res, next) =>
  Promise.resolve(router(req, res)).catch(next)

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

const isString = (v) => { return typeof v === 'string' }
const isNumber = (v) => { return typeof v === 'number' }
const isHexString = (v) => { return /^[0-9A-F]+$/i.test(v) }

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

export { asyncRouter, getSQL, isString, isNumber, isHexString, tokenEncode, tokenDecode }
