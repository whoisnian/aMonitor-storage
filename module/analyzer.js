import { poolQuery } from './dbPool'

const analyzer = {}

analyzer.cpu = {
  used_percent_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(used_percent)) as used_percent ' +
    'FROM cpuinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].used_percent < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.mem = {
  ram_used_percent_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(ram_used_percent)) as ram_used_percent ' +
    'FROM meminfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].ram_used_percent < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.load = {
  avg1_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(avg1)) as avg1 ' +
    'FROM loadinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].avg1 < rule.threshold) {
      return false
    }
    return true
  },
  avg5_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(avg5)) as avg5 ' +
    'FROM loadinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].avg5 < rule.threshold) {
      return false
    }
    return true
  },
  avg15_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(avg15)) as avg15 ' +
    'FROM loadinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].avg15 < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.net = {
  receive_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(receive_rate)) as receive_rate ' +
    'FROM netinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].receive_rate < rule.threshold) {
      return false
    }
    return true
  },
  transmit_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(transmit_rate)) as transmit_rate ' +
    'FROM netinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].transmit_rate < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.disk = {
  read_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(read_rate)) as read_rate ' +
    'FROM diskinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].read_rate < rule.threshold) {
      return false
    }
    return true
  },
  write_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(write_rate)) as write_rate ' +
    'FROM diskinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].write_rate < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.mount = {
  used_size_percent_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(used_size_percent)) as used_size_percent ' +
    'FROM mountinfos ' +
    'WHERE agent_id = $1 AND mount_point = $2 AND time >= $3'
    const res = await poolQuery(sql, [agentID, rule.addition, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].used_size_percent < rule.threshold) {
      return false
    }
    return true
  },
  used_nodes_percent_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(used_nodes_percent)) as used_nodes_percent ' +
    'FROM mountinfos ' +
    'WHERE agent_id = $1 AND mount_point = $2 AND time >= $3'
    const res = await poolQuery(sql, [agentID, rule.addition, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].used_nodes_percent < rule.threshold) {
      return false
    }
    return true
  }
}

analyzer.sshd = {
  login_by_password: async (agentID, rule, packet) => {
    return packet.MetaData.AuthInfo.startsWith('password')
  },
  login_ip_first_use: async (agentID, rule, packet) => {
    const sql =
    'SELECT ' +
    'count(*) ' +
    'FROM sshdinfos ' +
    'WHERE agent_id = $1 AND remote_host = $2 AND time < $3'
    const res = await poolQuery(sql, [agentID, packet.MetaData.RemoteHost, new Date(packet.Timestamp * 1000)])
    if (res.rowCount === 0 || res.rows[0].count > 0) {
      return false
    }
    return true
  }
}

analyzer.filemd = {
  md: async (agentID, rule, packet) => {
    return rule.addition === packet.MetaData.Path
  }
}

export { analyzer }
