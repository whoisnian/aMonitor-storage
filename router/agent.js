import { getAllAgents, getAgentInfobyID } from '../module/storage'

const allAgentsRouter = async (req, res) => {
  const agents = await getAllAgents()
  if (!agents) {
    res.status(200).send([])
    return
  }

  const agentList = agents.map((agent) => {
    return {
      id: agent.id,
      distro: agent.distro,
      hostname: agent.hostname
    }
  })

  res.status(200).send(agentList)
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
    cpu_model: agent.cpu_model,
    cpu_cores: agent.cpu_cores
  })
}

export { allAgentsRouter, agentInfoRouter }
