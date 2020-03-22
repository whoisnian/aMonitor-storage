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

export { asyncRouter, getSQL }
