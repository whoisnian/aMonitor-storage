import {
  insertRule,
  insertGroup,
  insertAgentGroup,
  getAllGroups,
  getGroupbyID,
  getRulesbyGroupID,
  getAgentsbyGroupID,
  getRulesbyAgentID,
  deleteGroupbyID,
  deleteRulebyID,
  updateRulebyID,
  deleteAgentGroupbyIDs
} from '../module/storage'
import { isString, isNumber } from '../module/util'

const createGroupRouter = async (req, res) => {
  const name = req.body.name
  if (!isString(name)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertGroup(name)

  res.status(200).send({ result: 'success' })
}

const createRuleRouter = async (req, res) => {
  const name = req.body.name
  const target = req.body.target
  const addition = req.body.addition
  const event = req.body.event
  const threshold = req.body.threshold
  const interval = req.body.interval
  const silent = req.body.silent
  const level = req.body.level
  const groupID = req.body.groupID
  if (!isString(name) || !isString(target) || !isString(addition) || !isString(event) || (threshold && !isNumber(threshold)) || (interval && !isNumber(interval)) || (silent && !isNumber(silent)) || !isString(level) || !isNumber(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertRule(name, target, addition, event, threshold, interval, silent, level, groupID)

  res.status(200).send({ result: 'success' })
}

const updateRuleRouter = async (req, res) => {
  const ruleID = parseInt(req.params.ruleID)
  const name = req.body.name
  const target = req.body.target
  const addition = req.body.addition
  const event = req.body.event
  const threshold = req.body.threshold
  const interval = req.body.interval
  const silent = req.body.silent
  const level = req.body.level
  const groupID = req.body.groupID
  if (isNaN(ruleID) || !isString(name) || !isString(target) || !isString(addition) || !isString(event) || (threshold && !isNumber(threshold)) || (interval && !isNumber(interval)) || (silent && !isNumber(silent)) || !isString(level) || !isNumber(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await updateRulebyID(ruleID, name, target, addition, event, threshold, interval, silent, level, groupID)

  res.status(200).send({ result: 'success' })
}

const createAgentGroupRouter = async (req, res) => {
  const agentID = req.body.agentID
  const groupID = req.body.groupID
  if (!isNumber(agentID) || !isNumber(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertAgentGroup(agentID, groupID)

  res.status(200).send({ result: 'success' })
}

const allGroupsRouter = async (req, res) => {
  const groups = await getAllGroups(false)
  if (!groups) {
    res.status(200).send([])
    return
  }

  const groupList = groups.map((group) => {
    return {
      id: group.id,
      name: group.name,
      created_at: group.created_at
    }
  })

  res.status(200).send(groupList)
}

const groupRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const group = await getGroupbyID(groupID)
  if (!group) {
    res.status(404).send({ error_type: 'GROUP_NOT_FOUND' })
    return
  }

  res.status(200).send({
    id: group.id,
    name: group.name,
    created_at: group.created_at
  })
}

const groupRulesRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const rules = await getRulesbyGroupID(groupID)
  if (!rules) {
    res.status(200).send([])
    return
  }

  const ruleList = rules.map((rule) => {
    return {
      id: rule.id,
      name: rule.name,
      target: rule.target,
      event: rule.event,
      addition: rule.addition,
      threshold: rule.threshold,
      interval: rule.interval,
      silent: rule.silent,
      level: rule.level,
      group_id: rule.group_id
    }
  })

  res.status(200).send(ruleList)
}

const groupAgentsRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const agents = await getAgentsbyGroupID(groupID)
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
      status: agent.status,
      deleted: agent.deleted
    }
  })

  res.status(200).send(agentList)
}

const agentRulesRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  if (isNaN(agentID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const rules = await getRulesbyAgentID(agentID)
  if (!rules) {
    res.status(200).send([])
    return
  }

  const ruleList = rules.map((rule) => {
    return {
      id: rule.id,
      name: rule.name,
      target: rule.target,
      addition: rule.addition,
      event: rule.event,
      threshold: rule.threshold,
      interval: rule.interval,
      silent: rule.silent,
      level: rule.level,
      group_id: rule.group_id
    }
  })

  res.status(200).send(ruleList)
}

const deleteGroupRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteGroupbyID(groupID)

  res.status(200).send({ result: 'success' })
}

const deleteRuleRouter = async (req, res) => {
  const ruleID = parseInt(req.params.ruleID)
  if (isNaN(ruleID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteRulebyID(ruleID)

  res.status(200).send({ result: 'success' })
}

const deleteAgentGroupRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  const groupID = parseInt(req.params.groupID)
  if (isNaN(agentID) || isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteAgentGroupbyIDs(agentID, groupID)

  res.status(200).send({ result: 'success' })
}

export {
  createGroupRouter,
  createRuleRouter,
  updateRuleRouter,
  createAgentGroupRouter,
  allGroupsRouter,
  groupRouter,
  groupRulesRouter,
  groupAgentsRouter,
  agentRulesRouter,
  deleteGroupRouter,
  deleteRuleRouter,
  deleteAgentGroupRouter
}
