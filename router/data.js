import {
  batchCpuInfobyID,
  batchMemInfobyID,
  batchLoadInfobyID,
  batchNetInfobyID,
  batchDiskInfobyID,
  batchMountsInfobyID,
  batchSshdInfobyID,
  batchFileMDInfobyID
} from '../module/storage'

const dataRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  const fromInt = parseInt(req.query.from)
  const toInt = parseInt(req.query.to)
  if (isNaN(agentID) || isNaN(fromInt) || isNaN(toInt)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const from = new Date(fromInt)
  const to = new Date(toInt)

  let infos, payload
  const category = req.params.category
  switch (category) {
    case 'cpuinfo':
      infos = await batchCpuInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          used_percent: info.used_percent
        }
      })
      res.status(200).send(payload)
      break
    case 'meminfo':
      infos = await batchMemInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          ram_used_percent: info.ram_used_percent,
          swap_used_percent: info.swap_used_percent
        }
      })
      res.status(200).send(payload)
      break
    case 'loadinfo':
      infos = await batchLoadInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          avg1: info.avg1,
          avg5: info.avg5,
          avg15: info.avg15
        }
      })
      res.status(200).send(payload)
      break
    case 'netinfo':
      infos = await batchNetInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          receive_rate: info.receive_rate,
          receive_packets: info.receive_packets,
          transmit_rate: info.transmit_rate,
          transmit_packets: info.transmit_packets
        }
      })
      res.status(200).send(payload)
      break
    case 'diskinfo':
      infos = await batchDiskInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          read_req: info.read_req,
          write_req: info.write_req,
          read_rate: info.read_rate,
          write_rate: info.write_rate
        }
      })
      res.status(200).send(payload)
      break
    case 'mountsinfo':
      infos = await batchMountsInfobyID(agentID)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          dev_name: info.dev_name,
          mount_point: info.mount_point,
          fs_type: info.fs_type,
          total_size: info.total_size,
          avail_size: info.avail_size,
          used_size_percent: info.used_size_percent,
          used_nodes_percent: info.used_nodes_percent
        }
      })
      res.status(200).send(payload)
      break
    case 'sshdinfo':
      infos = await batchSshdInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          username: info.username,
          remote_host: info.remote_host,
          auth_method: info.auth_method
        }
      })
      res.status(200).send(payload)
      break
    case 'filemdinfo':
      infos = await batchFileMDInfobyID(agentID, from, to)
      if (!infos) {
        res.status(200).send([])
        return
      }

      payload = infos.map((info) => {
        return {
          time: info.time,
          path: info.path,
          event: info.event
        }
      })
      res.status(200).send(payload)
      break
    default:
      res.status(400).send({ error_type: 'INVALID_PARAMS' })
  }
}

export { dataRouter }
