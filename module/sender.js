import {
  updateAgentStatusbyID,
  insertMessage,
  getReceiversbyGroupID
} from './storage'

const sendMessage = async (content, agentID, rule) => {
  await insertMessage(content, agentID, rule.id, rule.group_id)
  await updateAgentStatusbyID('error', agentID)

  const receivers = await getReceiversbyGroupID(rule.group_id)
  if (!receivers) return
  receivers.forEach((receiver) => {
    switch (receiver.type) {
      case 'email':
        console.log(`Send to ${receiver.name} by email`)
        console.log(content)
        break
      case 'wechat':
        console.log(`Send to ${receiver.name} by wechat`)
        console.log(content)
        break
      case 'dingding':
        console.log(`Send to ${receiver.name} by dingding`)
        console.log(content)
        break
      case 'lark':
        console.log(`Send to ${receiver.name} by lark`)
        console.log(content)
        break
      case 'sms':
        console.log(`Send to ${receiver.name} by sms`)
        console.log(content)
        break
    }
  })
}

export { sendMessage }
