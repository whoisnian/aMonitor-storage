import { poolQuery, poolTransaction } from './dbPool'

const registerAgent = async (token) => {
  const sql =
  'INSERT ' +
  'INTO agents(token) ' +
  'VALUES ($1) ' +
  'ON CONFLICT DO NOTHING'
  const res = await poolQuery(sql, [token])
  return res.rowCount === 1
}

const getAgentIDbyToken = async (token) => {
  const sql =
  'SELECT ' +
  'id ' +
  'FROM agents ' +
  'WHERE token = $1'
  const res = await poolQuery(sql, [token])
  if (res.rowCount === 0) {
    return -1
  }
  return res.rows[0].id
}

const updateBasicInfo = async (packet, agentID) => {
  const sql =
  'UPDATE ' +
  'agents ' +
  'SET (distro, kernel, hostname, cpu_model, cpu_cores, status, updated_at) = ($1, $2, $3, $4, $5, $6, $7) ' +
  'WHERE id = $8'
  await poolQuery(sql, [
    packet.MetaData.Distro,
    packet.MetaData.Kernel,
    packet.MetaData.Hostname,
    packet.MetaData.CPUModel,
    packet.MetaData.CPUCores,
    'ok',
    new Date(packet.Timestamp * 1000),
    agentID])
}

const updateAgentStatusbyID = async (status, id) => {
  const sql =
  'UPDATE ' +
  'agents ' +
  'SET (status, updated_at) = ($1, $2) ' +
  'WHERE id = $3'
  await poolQuery(sql, [
    status,
    new Date(),
    id])
}

const updateIPAddress = async (ip, agentID) => {
  const sql =
  'UPDATE ' +
  'agents ' +
  'SET ip = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql, [ip, agentID])
}

const insertCpuInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO cpuinfos(used_percent, time, agent_id) ' +
  'VALUES ($1, $2, $3)'
  await poolQuery(sql, [
    packet.MetaData.UsedPCT,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertMemInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO meminfos(ram_total, ram_cached, ram_used, ram_free, ram_avail, ram_used_percent, swap_total, swap_used, swap_free, swap_used_percent, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)'
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
  const sql =
  'INSERT ' +
  'INTO loadinfos(avg1, avg5, avg15, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5)'
  await poolQuery(sql, [
    packet.MetaData.Avg1,
    packet.MetaData.Avg5,
    packet.MetaData.Avg15,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertNetInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO netinfos(receive_rate, receive_sum, receive_packets, transmit_rate, transmit_sum, transmit_packets, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
  await poolQuery(sql, [
    packet.MetaData.Rrate,
    packet.MetaData.Rsum,
    packet.MetaData.Rpackets,
    packet.MetaData.Trate,
    packet.MetaData.Tsum,
    packet.MetaData.Tpackets,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertDiskInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO diskinfos(read_req, write_req, read_rate, write_rate, read_size, write_size, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
  await poolQuery(sql, [
    packet.MetaData.ReadPS,
    packet.MetaData.WritePS,
    packet.MetaData.ReadRate,
    packet.MetaData.WriteRate,
    packet.MetaData.ReadSize,
    packet.MetaData.WriteSize,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertMountsInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO mountinfos(dev_name, mount_point, fs_type, total_size, free_size, avail_size, used_size_percent, total_nodes, free_nodes, used_nodes_percent, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)'
  const queries = []

  for (const mount of packet.MetaData.Mounts) {
    queries.push({
      text: sql,
      params: [
        mount.DevName,
        mount.Point,
        mount.FsType,
        mount.TotalSize,
        mount.FreeSize,
        mount.AvailSize,
        mount.UsedSizePCT,
        mount.TotalNodes,
        mount.FreeNodes,
        mount.UsedNodesPCT,
        new Date(packet.Timestamp * 1000),
        agentID
      ]
    })
  }
  await poolTransaction(queries)
}

const insertSshdInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO sshdinfos(username, remote_host, auth_method, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4, $5)'
  await poolQuery(sql, [
    packet.MetaData.Username,
    packet.MetaData.RemoteHost,
    packet.MetaData.AuthInfo,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertFileMDInfo = async (packet, agentID) => {
  const sql =
  'INSERT ' +
  'INTO filemdinfos(path, event, time, agent_id) ' +
  'VALUES ($1, $2, $3, $4)'
  await poolQuery(sql, [
    packet.MetaData.Path,
    packet.MetaData.Event,
    new Date(packet.Timestamp * 1000),
    agentID])
}

const insertUser = async (email, username, password) => {
  const sql =
  'INSERT ' +
  'INTO users(email, username, password) ' +
  'VALUES ($1, $2, $3)'
  const res = await poolQuery(sql, [
    email,
    username,
    password])
  return res.rowCount === 1
}

const authUser = async (email, password) => {
  const sql =
  'SELECT ' +
  'id ' +
  'FROM users ' +
  'WHERE email = $1 AND password = $2'
  const res = await poolQuery(sql, [
    email,
    password])
  if (res.rowCount === 0) {
    return -1
  }
  return res.rows[0].id
}

const getUserIDbyEmail = async (email) => {
  const sql =
  'SELECT ' +
  'id ' +
  'FROM users ' +
  'WHERE email = $1'
  const res = await poolQuery(sql, [email])
  if (res.rowCount === 0) {
    return -1
  }
  return res.rows[0].id
}

const getUserInfobyID = async (id) => {
  const sql =
  'SELECT ' +
  '* ' +
  'FROM users ' +
  'WHERE id = $1'
  const res = await poolQuery(sql, [id])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows[0]
}

const getAllAgents = async (deleted = false) => {
  const sql =
  'SELECT ' +
  'id, distro, hostname, ip, status, deleted ' +
  'FROM agents ' +
  'WHERE deleted = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [deleted])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getAgentInfobyID = async (id) => {
  const sql =
  'SELECT ' +
  'id, distro, kernel, hostname, ip, cpu_model, cpu_cores, status, deleted ' +
  'FROM agents ' +
  'WHERE id = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [id])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows[0]
}

const deleteAgentbyID = async (id) => {
  const sql =
  'UPDATE ' +
  'agents ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql, [true, id])
}

const recoverAgentbyID = async (id) => {
  const sql =
  'UPDATE ' +
  'agents ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql, [false, id])
}

const batchCpuInfobyID = async (id, from, to, bucket) => {
  const sql =
  'SELECT ' +
  'time_bucket($1, time) as bucket_time, ' +
  'floor(avg(used_percent)) as used_percent ' +
  'FROM cpuinfos ' +
  'WHERE agent_id = $2 AND time BETWEEN $3 AND $4 ' +
  'GROUP BY bucket_time ' +
  'ORDER BY bucket_time'
  const res = await poolQuery(sql, [bucket, id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchMemInfobyID = async (id, from, to, bucket) => {
  const sql =
  'SELECT ' +
  'time_bucket($1, time) as bucket_time, ' +
  'floor(avg(ram_used_percent)) as ram_used_percent, ' +
  'floor(avg(swap_used_percent)) as swap_used_percent ' +
  'FROM meminfos ' +
  'WHERE agent_id = $2 AND time BETWEEN $3 AND $4 ' +
  'GROUP BY bucket_time ' +
  'ORDER BY bucket_time'
  const res = await poolQuery(sql, [bucket, id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchLoadInfobyID = async (id, from, to, bucket) => {
  const sql =
  'SELECT ' +
  'time_bucket($1, time) as bucket_time, ' +
  'floor(avg(avg1)) as avg1, ' +
  'floor(avg(avg5)) as avg5, ' +
  'floor(avg(avg15)) as avg15 ' +
  'FROM loadinfos ' +
  'WHERE agent_id = $2 AND time BETWEEN $3 AND $4 ' +
  'GROUP BY bucket_time ' +
  'ORDER BY bucket_time'
  const res = await poolQuery(sql, [bucket, id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchNetInfobyID = async (id, from, to, bucket) => {
  const sql =
  'SELECT ' +
  'time_bucket($1, time) as bucket_time, ' +
  'floor(avg(receive_rate)) as receive_rate, ' +
  'floor(avg(receive_packets)) as receive_packets, ' +
  'floor(avg(transmit_rate)) as transmit_rate, ' +
  'floor(avg(transmit_packets)) as transmit_packets ' +
  'FROM netinfos ' +
  'WHERE agent_id = $2 AND time BETWEEN $3 AND $4 ' +
  'GROUP BY bucket_time ' +
  'ORDER BY bucket_time'
  const res = await poolQuery(sql, [bucket, id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchDiskInfobyID = async (id, from, to, bucket) => {
  const sql =
  'SELECT ' +
  'time_bucket($1, time) as bucket_time, ' +
  'floor(avg(read_req)) as read_req, ' +
  'floor(avg(write_req)) as write_req, ' +
  'floor(avg(read_rate)) as read_rate, ' +
  'floor(avg(write_rate)) as write_rate ' +
  'FROM diskinfos ' +
  'WHERE agent_id = $2 AND time BETWEEN $3 AND $4 ' +
  'GROUP BY bucket_time ' +
  'ORDER BY bucket_time'
  const res = await poolQuery(sql, [bucket, id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchMountsInfobyID = async (id) => {
  const sql =
  'SELECT ' +
  'dev_name, ' +
  'last(mount_point, time) as mount_point, ' +
  'last(fs_type, time) as fs_type, ' +
  'last(total_size, time) as total_size, ' +
  'last(avail_size, time) as avail_size, ' +
  'last(used_size_percent, time) as used_size_percent, ' +
  'last(used_nodes_percent, time) as used_nodes_percent ' +
  'FROM mountinfos ' +
  'WHERE agent_id = $1 ' +
  'GROUP BY dev_name ' +
  'ORDER BY dev_name'
  const res = await poolQuery(sql, [id])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchSshdInfobyID = async (id, from, to) => {
  const sql =
  'SELECT ' +
  'EXTRACT(EPOCH FROM time)*1000 as time, ' +
  'username, remote_host, auth_method ' +
  'FROM sshdinfos ' +
  'WHERE agent_id = $1 AND time BETWEEN $2 AND $3 ' +
  'ORDER BY time DESC'
  const res = await poolQuery(sql, [id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const batchFileMDInfobyID = async (id, from, to) => {
  const sql =
  'SELECT ' +
  'EXTRACT(EPOCH FROM time)*1000 as time, ' +
  'path, event ' +
  'FROM filemdinfos ' +
  'WHERE agent_id = $1 AND time BETWEEN $2 AND $3 ' +
  'ORDER BY time DESC'
  const res = await poolQuery(sql, [id, from, to])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const insertRule = async (name, target, event, threshold, interval, silent, level, groupID) => {
  const sql =
  'INSERT ' +
  'INTO rules(name, target, event, threshold, interval, silent, level, group_id) ' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
  await poolQuery(sql, [
    name,
    target,
    event,
    threshold,
    interval,
    silent,
    level,
    groupID])
}

const insertRuleGroup = async (name) => {
  const sql =
  'INSERT ' +
  'INTO rulegroups(name) ' +
  'VALUES ($1)'
  await poolQuery(sql, [name])
}

const insertAgentrule = async (agentID, ruleID) => {
  const sql =
  'INSERT ' +
  'INTO agentrules(agent_id, rule_id) ' +
  'VALUES ($1, $2)'
  await poolQuery(sql, [agentID, ruleID])
}

const getAllRuleGroups = async (deleted) => {
  const sql =
  'SELECT ' +
  'id, name, created_at ' +
  'FROM rulegroups ' +
  'WHERE deleted = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [deleted])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getRulesbyGroupID = async (groupID) => {
  const sql =
  'SELECT ' +
  'id, name, target, event, addition, threshold, interval, silent, level, group_id ' +
  'FROM rules ' +
  'WHERE deleted = false AND group_id = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [groupID])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getRulesbyAgentID = async (AgentID) => {
  const sql =
  'SELECT ' +
  'agentrules.rule_id as id, rules.name, rules.target, rules.event, rules.threshold, rules.interval, rules.silent, rules.level, rules.group_id ' +
  'FROM agentrules ' +
  'INNER JOIN rules ON rules.id = agentrules.rule_id AND rules.deleted = false ' +
  'WHERE agent_id = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [AgentID])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const deleteRuleGroupbyID = async (groupID) => {
  const sql1 =
  'UPDATE ' +
  'rulegroups ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql1, [true, groupID])

  const sql2 =
  'UPDATE ' +
  'rules ' +
  'SET deleted = $1 ' +
  'WHERE group_id = $2'
  await poolQuery(sql2, [true, groupID])

  const sql3 =
  'DELETE ' +
  'FROM receivergroups ' +
  'WHERE group_id = $1'
  await poolQuery(sql3, [groupID])
}

const deleteRulebyID = async (ruleID) => {
  const sql1 =
  'UPDATE ' +
  'rules ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql1, [true, ruleID])

  const sql2 =
  'DELETE ' +
  'FROM agentrules ' +
  'WHERE rule_id = $1'
  await poolQuery(sql2, [ruleID])
}

const deleteAgentRulebyIDs = async (agentID, ruleID) => {
  const sql =
  'DELETE ' +
  'FROM agentrules ' +
  'WHERE agent_id = $1 AND rule_id = $2'
  await poolQuery(sql, [agentID, ruleID])
}

const insertReceiver = async (name, type, addr, token) => {
  const sql =
  'INSERT ' +
  'INTO receivers(name, type, addr, token) ' +
  'VALUES ($1, $2, $3, $4)'
  await poolQuery(sql, [
    name,
    type,
    addr,
    token])
}

const insertReceiverGroup = async (receiverID, groupID) => {
  const sql =
  'INSERT ' +
  'INTO receivergroups(receiver_id, group_id) ' +
  'VALUES ($1, $2)'
  await poolQuery(sql, [receiverID, groupID])
}

const insertMessage = async (content, agentID, ruleID, groupID, level) => {
  const sql =
  'INSERT ' +
  'INTO messages(content, agent_id, rule_id, group_id, level) ' +
  'VALUES ($1, $2, $3, $4)'
  await poolQuery(sql, [
    content,
    agentID,
    ruleID,
    groupID,
    level])
}

const getAllReceivers = async (deleted) => {
  const sql =
  'SELECT ' +
  'id, name, type, addr, token, created_at ' +
  'FROM receivers ' +
  'WHERE deleted = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [deleted])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getAllMessages = async (deleted) => {
  const sql =
  'SELECT ' +
  'id, content, agent_id, rule_id, group_id, level, created_at ' +
  'FROM messages ' +
  'WHERE deleted = $1 ' +
  'ORDER BY id DESC'
  const res = await poolQuery(sql, [deleted])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getReceiversbyGroupID = async (groupID) => {
  const sql =
  'SELECT ' +
  'receivergroups.receiver_id as id, receivers.name, receivers.type, receivers.addr, receivers.token, receivers.created_at ' +
  'FROM receivergroups ' +
  'INNER JOIN receivers ON receivers.id = receivergroups.receiver_id AND receivers.deleted = false ' +
  'WHERE group_id = $1 ' +
  'ORDER BY id'
  const res = await poolQuery(sql, [groupID])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const getMessagesbyAgentID = async (agentID) => {
  const sql =
  'SELECT ' +
  'id, content, rule_id, group_id, level, created_at ' +
  'FROM messages ' +
  'WHERE agent_id = $1 AND deleted = false ' +
  'ORDER BY id DESC'
  const res = await poolQuery(sql, [agentID])
  if (res.rowCount === 0) {
    return null
  }
  return res.rows
}

const deleteReceiverbyID = async (id) => {
  const sql =
  'UPDATE ' +
  'receivers ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql, [true, id])
}

const deleteReceivergroupbyIDs = async (receiverID, groupID) => {
  const sql =
  'DELETE ' +
  'FROM receivergroups ' +
  'WHERE receiver_id = $1 AND group_id = $2'
  await poolQuery(sql, [receiverID, groupID])
}

const deleteMessagebyID = async (id) => {
  const sql =
  'UPDATE ' +
  'messages ' +
  'SET deleted = $1 ' +
  'WHERE id = $2'
  await poolQuery(sql, [true, id])
}

export {
  registerAgent,
  getAgentIDbyToken,
  updateBasicInfo,
  updateAgentStatusbyID,
  updateIPAddress,
  insertCpuInfo,
  insertMemInfo,
  insertLoadInfo,
  insertNetInfo,
  insertDiskInfo,
  insertMountsInfo,
  insertSshdInfo,
  insertFileMDInfo,
  insertUser,
  authUser,
  getUserIDbyEmail,
  getUserInfobyID,
  getAllAgents,
  getAgentInfobyID,
  deleteAgentbyID,
  recoverAgentbyID,
  batchCpuInfobyID,
  batchMemInfobyID,
  batchLoadInfobyID,
  batchNetInfobyID,
  batchDiskInfobyID,
  batchMountsInfobyID,
  batchSshdInfobyID,
  batchFileMDInfobyID,
  insertRule,
  insertRuleGroup,
  insertAgentrule,
  getAllRuleGroups,
  getRulesbyGroupID,
  getRulesbyAgentID,
  deleteRuleGroupbyID,
  deleteRulebyID,
  deleteAgentRulebyIDs,
  insertReceiver,
  insertReceiverGroup,
  insertMessage,
  getAllReceivers,
  getAllMessages,
  getReceiversbyGroupID,
  getMessagesbyAgentID,
  deleteReceiverbyID,
  deleteReceivergroupbyIDs,
  deleteMessagebyID
}
