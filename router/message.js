import {
  getAllMessages,
  getMessagesbyAgentID,
  deleteMessagebyID
} from '../module/storage'

const allMessagesRouter = async (req, res) => {
  const messages = await getAllMessages(false)
  if (!messages) {
    res.status(200).send([])
    return
  }

  const messageList = messages.map((message) => {
    return {
      id: message.id,
      content: message.content,
      agent_id: message.agent_id,
      rule_id: message.rule_id,
      group_id: message.group_id,
      level: message.level,
      created_at: message.created_at
    }
  })

  res.status(200).send(messageList)
}

const agentMessagesRouter = async (req, res) => {
  const agentID = parseInt(req.params.agentID)
  if (isNaN(agentID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const messages = await getMessagesbyAgentID(agentID)
  if (!messages) {
    res.status(200).send([])
    return
  }

  const messageList = messages.map((message) => {
    return {
      id: message.id,
      content: message.content,
      agent_id: message.agent_id,
      rule_id: message.rule_id,
      group_id: message.group_id,
      level: message.level,
      created_at: message.created_at
    }
  })

  res.status(200).send(messageList)
}

const deleteMessageRouter = async (req, res) => {
  const messageID = parseInt(req.params.messageID)
  if (isNaN(messageID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteMessagebyID(messageID)

  res.status(200).send({ result: 'success' })
}

export {
  allMessagesRouter,
  agentMessagesRouter,
  deleteMessageRouter
}
