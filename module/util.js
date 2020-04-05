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
  const iv = randomBytes(8)
  const cipher = createCipheriv('AES-256-CFB', key, iv.toString('hex'))

  let res = cipher.update(raw, 'hex', 'base64')
  res += cipher.final('base64')
  return iv.toString('base64') + res
}

const tokenDecode = (raw, key) => {
  const iv = Buffer.from(raw.slice(0, 12), 'base64')
  const encrypted = raw.slice(12)
  const decipher = createDecipheriv('AES-256-CFB', key, iv.toString('hex'))

  let res = decipher.update(encrypted, 'base64', 'hex')
  res += decipher.final('hex')
  return res
}

export { asyncRouter, getSQL, isString, isNumber, isHexString, tokenEncode, tokenDecode }
