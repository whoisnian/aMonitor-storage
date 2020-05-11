import {
  insertRule,
  insertRuleGroup,
  insertAgentrule,
  getAllRuleGroups,
  getRulesbyGroupID,
  getRulesbyAgentID,
  deleteRuleGroupbyID,
  deleteRulebyID,
  updateRulebyID,
  deleteAgentRulebyIDs
} from '../module/storage'
import { isString, isNumber } from '../module/util'

const createRuleGroupRouter = async (req, res) => {
  const name = req.body.name
  if (!isString(name)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertRuleGroup(name)

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

const createAgentRuleRouter = async (req, res) => {
  const agentID = req.body.agentID
  const ruleID = req.body.ruleID
  if (!isNumber(agentID) || !isNumber(ruleID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertAgentrule(agentID, ruleID)

  res.status(200).send({ result: 'success' })
}

const allRuleGroupsRouter = async (req, res) => {
  const groups = await getAllRuleGroups(false)
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

const deleteRuleGroupRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteRuleGroupbyID(groupID)

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

const deleteAgentRuleRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  const ruleID = parseInt(req.params.ruleID)
  if (isNaN(agentID) || isNaN(ruleID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteAgentRulebyIDs(agentID, ruleID)

  res.status(200).send({ result: 'success' })
}

export {
  createRuleGroupRouter,
  createRuleRouter,
  updateRuleRouter,
  createAgentRuleRouter,
  allRuleGroupsRouter,
  groupRulesRouter,
  agentRulesRouter,
  deleteRuleGroupRouter,
  deleteRuleRouter,
  deleteAgentRuleRouter
}
