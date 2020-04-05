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

const updateBasicInfo = async (packet, agentID) => {
  const sql = 'UPDATE agents set (distro, kernel, hostname, cpu_model, cpu_cores, updated_at) = ($1, $2, $3, $4, $5, $6) where id = $7'
  const now = new Date()
  await poolQuery(sql, [
    packet.MetaData.Distro,
    packet.MetaData.Kernel,
    packet.MetaData.Hostname,
    packet.MetaData.CPUModel,
    packet.MetaData.CPUCores,
    now,
    agentID])
}

export {
  registerAgent,
  getAgentIDbyToken,
  updateBasicInfo
}
