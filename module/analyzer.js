import { poolQuery } from './dbPool'
import { calcFromBytes } from './util'

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
      return { checked: false, content: '' }
    }
    return { checked: true, content: `CPU使用率平均值达到了 ${res.rows[0].used_percent / 100}%` }
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
      return { checked: false, content: '' }
    }
    return { checked: true, content: `内存占用率平均值达到了 ${res.rows[0].ram_used_percent / 100}%` }
  }
}

analyzer.load = {
  avg1_reach: async (agentID, rule, packet) => {
    if (packet.MetaData.Avg1 < rule.threshold) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `1分钟系统平均负载达到了 ${packet.MetaData.Avg1 / 100}` }
  },
  avg5_reach: async (agentID, rule, packet) => {
    if (packet.MetaData.Avg5 < rule.threshold) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `5分钟系统平均负载达到了 ${packet.MetaData.Avg5 / 100}` }
  },
  avg15_reach: async (agentID, rule, packet) => {
    if (packet.MetaData.Avg15 < rule.threshold) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `15分钟系统平均负载达到了 ${packet.MetaData.Avg15 / 100}` }
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
      return { checked: false, content: '' }
    }
    return { checked: true, content: `平均下载速度达到了 ${calcFromBytes(res.rows[0].receive_rate)}/s` }
  },
  transmit_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(transmit_rate)) as transmit_rate ' +
    'FROM netinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].transmit_rate < rule.threshold) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `平均上传速度达到了 ${calcFromBytes(res.rows[0].transmit_rate)}/s` }
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
      return { checked: false, content: '' }
    }
    return { checked: true, content: `平均磁盘读取速度达到了 ${calcFromBytes(res.rows[0].read_rate)}/s` }
  },
  write_rate_reach: async (agentID, rule) => {
    const sql =
    'SELECT ' +
    'floor(avg(write_rate)) as write_rate ' +
    'FROM diskinfos ' +
    'WHERE agent_id = $1 AND time >= $2'
    const res = await poolQuery(sql, [agentID, new Date(Date.now() - rule.interval)])
    if (res.rowCount === 0 || res.rows[0].write_rate < rule.threshold) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `平均磁盘写入速度达到了 ${calcFromBytes(res.rows[0].write_rate)}/s` }
  }
}

analyzer.mount = {
  used_size_percent_reach: async (agentID, rule, packet) => {
    for (const mount of packet.MetaData.Mounts) {
      if (mount.Point === rule.addition && mount.UsedSizePCT >= rule.threshold) {
        return { checked: true, content: `'${mount.Point}'目录磁盘空间利用率达到了 ${mount.UsedSizePCT / 100}%` }
      }
    }
    return { checked: false, content: '' }
  },
  used_nodes_percent_reach: async (agentID, rule, packet) => {
    for (const mount of packet.MetaData.Mounts) {
      if (mount.Point === rule.addition && mount.UsedNodesPCT >= rule.threshold) {
        return { checked: true, content: `'${mount.Point}'目录磁盘inode利用率达到了 ${mount.UsedNodesPCT / 100}%` }
      }
    }
    return { checked: false, content: '' }
  }
}

analyzer.sshd = {
  login_by_password: async (agentID, rule, packet) => {
    if (packet.MetaData.AuthInfo.startsWith('password')) {
      return { checked: true, content: '有用户使用密码进行了SSH登录' }
    }
    return { checked: false, content: '' }
  },
  login_ip_first_use: async (agentID, rule, packet) => {
    const sql =
    'SELECT ' +
    'count(*) ' +
    'FROM sshdinfos ' +
    'WHERE agent_id = $1 AND remote_host = $2 AND time < $3'
    const res = await poolQuery(sql, [agentID, packet.MetaData.RemoteHost, new Date(packet.Timestamp * 1000)])
    if (res.rowCount === 0 || res.rows[0].count > 0) {
      return { checked: false, content: '' }
    }
    return { checked: true, content: `有用户首次从IP地址 ${packet.MetaData.RemoteHost} 登录` }
  }
}

analyzer.filemd = {
  md: async (agentID, rule, packet) => {
    if (rule.addition === packet.MetaData.Path) {
      return { checked: true, content: `文件'${packet.MetaData.Path}'已被修改` }
    }
    return { checked: false, content: '' }
  }
}

export { analyzer }
