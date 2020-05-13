import { createTransport } from 'nodemailer'
import { config } from './config'
import { logger } from './logger'
import { postJSON } from './util'
import {
  updateAgentStatusbyID,
  insertMessage,
  getReceiversbyGroupID
} from './storage'

const transporter = createTransport(config.smtp)

const sendMessage = async (content, agentID, rule) => {
  await insertMessage(content, agentID, rule.id, rule.group_id, rule.level)
  await updateAgentStatusbyID('error', agentID)

  const receivers = await getReceiversbyGroupID(rule.group_id)
  if (!receivers) return
  receivers.forEach((receiver) => {
    switch (receiver.type) {
      case 'email':
        transporter.sendMail({
          from: config.smtp.from,
          to: receiver.addr,
          subject: 'aMonitor监控报警',
          html: `<h3>${content}</h3>` +
          `<p>主机编号： ${agentID}</p>` +
          `<p>主机状态面板： <a href='${config.prefix}/agent?id=${agentID}'>${config.prefix}/agent?id=${agentID}</a></p>`
        })
        logger.info(`Send message to ${receiver.name} by email`)
        break
      case 'wechat':
        postJSON(receiver.addr, {
          msgtype: 'markdown',
          markdown: {
            content: `##### ${content}\n` +
            `主机编号： ${agentID}\n` +
            `主机状态面板： [${config.prefix}/agent?id=${agentID}](${config.prefix}/agent?id=${agentID})`
          }
        })
        logger.info(`Send message to ${receiver.name} by wechat`)
        break
      case 'dingding':
        postJSON(receiver.addr, {
          msgtype: 'markdown',
          markdown: {
            title: 'aMonitor监控报警',
            text: `##### ${content}\n` +
            `主机编号： ${agentID}\n\n` +
            `主机状态面板： [${config.prefix}/agent?id=${agentID}](${config.prefix}/agent?id=${agentID})`
          }
        })
        logger.info(`Send message to ${receiver.name} by dingding`)
        break
      case 'lark':
        postJSON(receiver.addr, {
          title: 'aMonitor监控报警',
          text: `${content}\n` +
          `主机编号： ${agentID}\n` +
          `主机状态面板： ${config.prefix}/agent?id=${agentID}`
        })
        logger.info(`Send message to ${receiver.name} by lark`)
        break
      case 'sms':
        logger.info(`Send message to ${receiver.name} by sms`)
        logger.info(content)
        break
    }
  })
}

export { sendMessage }
