import {
  recent7daysMessagesCount,
  currentErrorAgentsCount,
  currentOkAgentsCount
} from '../module/storage'

const overviewRouter = async (req, res) => {
  const messagesCount = await recent7daysMessagesCount()
  const errorAgentsCount = await currentErrorAgentsCount()
  const okAgentsCount = await currentOkAgentsCount()

  res.status(200).send({
    messagesCount,
    errorAgentsCount,
    okAgentsCount
  })
}

export { overviewRouter }
