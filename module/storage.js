import { poolQuery } from './dbPool'

const registerAgent = async (token) => {
  const sql = 'INSERT INTO agents(token) VALUES ($1) ON CONFLICT DO NOTHING'
  const res = await poolQuery(sql, [token])
  return res.rowCount === 1
}

const getAgentIDbyToken = async (token) => {
  const sql = 'SELECT id FROM agents WHERE token = $1'
  const res = await poolQuery(sql, [token])
  if (res.rowCount === 0) {
    return -1
  }
  return res.rows[0].id
}

export {
  registerAgent,
  getAgentIDbyToken
}
