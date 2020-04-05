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
  const sql = 'UPDATE agents SET (distro, kernel, hostname, cpu_model, cpu_cores, updated_at) = ($1, $2, $3, $4, $5, $6) where id = $7'
  await poolQuery(sql, [
    packet.MetaData.Distro,
    packet.MetaData.Kernel,
    packet.MetaData.Hostname,
    packet.MetaData.CPUModel,
    packet.MetaData.CPUCores,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertCpuInfo = async (packet, agentID) => {
  const sql = 'INSERT INTO cpuinfos(used_percent, time, agent_id) VALUES ($1, $2, $3)'
  await poolQuery(sql, [
    packet.MetaData.UsedPCT,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertMemInfo = async (packet, agentID) => {
  const sql = 'INSERT INTO meminfos(ram_total, ram_cached, ram_used, ram_free, ram_avail, ram_used_percent, swap_total, swap_used, swap_free, swap_used_percent, time, agent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)'
  await poolQuery(sql, [
    packet.MetaData.RAMTotal,
    packet.MetaData.RAMCached,
    packet.MetaData.RAMUsed,
    packet.MetaData.RAMFree,
    packet.MetaData.RAMAvail,
    packet.MetaData.RAMUsedPCT,
    packet.MetaData.SwapTotal,
    packet.MetaData.SwapUsed,
    packet.MetaData.SwapFree,
    packet.MetaData.SwapUsedPCT,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertLoadInfo = async (packet, agentID) => {
  const sql = 'INSERT INTO loadinfos(avg1, avg5, avg15, time, agent_id) VALUES ($1, $2, $3, $4, $5)'
  await poolQuery(sql, [
    packet.MetaData.Avg1,
    packet.MetaData.Avg5,
    packet.MetaData.Avg15,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertNetInfo = async (packet, agentID) => {
  const sql = 'INSERT INTO netinfos(receive_rate, receive_sum, transmit_rate, transmit_sum, time, agent_id) VALUES ($1, $2, $3, $4, $5, $6)'
  await poolQuery(sql, [
    packet.MetaData.Rrate,
    packet.MetaData.Rsum,
    packet.MetaData.Trate,
    packet.MetaData.Tsum,
    new Date(packet.Timestamp * 1000),
    agentID])
}

export {
  registerAgent,
  getAgentIDbyToken,
  updateBasicInfo,
  insertCpuInfo,
  insertMemInfo,
  insertLoadInfo,
  insertNetInfo
}
