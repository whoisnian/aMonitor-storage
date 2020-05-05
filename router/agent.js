import {
  getAllAgents,
  getAgentInfobyID,
  deleteAgentbyID,
  recoverAgentbyID
} from '../module/storage'

const allAgentsRouter = async (req, res) => {
  const deleted = (req.query.deleted === 'true')

  const agents = await getAllAgents(deleted)
  if (!agents) {
    res.status(200).send([])
    return
  }

  const agentList = agents.map((agent) => {
    return {
      id: agent.id,
      distro: agent.distro,
      hostname: agent.hostname,
      ip: agent.ip,
      deleted: agent.deleted
    }
  })

  res.status(200).send(agentList)
}

const deleteAgentRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  if (isNaN(agentID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteAgentbyID(agentID)

  res.status(200).send({ result: 'success' })
}

const recoverAgentRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  if (isNaN(agentID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await recoverAgentbyID(agentID)

  res.status(200).send({ result: 'success' })
}

const agentInfoRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  if (isNaN(agentID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const agent = await getAgentInfobyID(agentID)
  if (!agent) {
    res.status(404).send({ error_type: 'AGENT_NOT_FOUND' })
    return
  }

  res.status(200).send({
    id: agent.id,
    distro: agent.distro,
    kernel: agent.kernel,
    hostname: agent.hostname,
    ip: agent.ip,
    cpu_model: agent.cpu_model,
    cpu_cores: agent.cpu_cores,
    deleted: agent.deleted
  })
}

export {
  allAgentsRouter,
  deleteAgentRouter,
  recoverAgentRouter,
  agentInfoRouter
}
