import {
  insertReceiver,
  getAllReceivers,
  getReceiversbyGroupID,
  deleteReceiverbyID,
  updateReceiverbyID,
  insertReceiverGroup,
  deleteReceivergroupbyIDs
} from '../module/storage'
import { isString, isNumber } from '../module/util'

const createReceiverRouter = async (req, res) => {
  const name = req.body.name
  const type = req.body.type
  const addr = req.body.addr
  const token = req.body.token
  if (!isString(name) || !isString(type) || !isString(addr) || !isString(token)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertReceiver(name, type, addr, token)

  res.status(200).send({ result: 'success' })
}

const allReceiversRouter = async (req, res) => {
  const receivers = await getAllReceivers(false)
  if (!receivers) {
    res.status(200).send([])
    return
  }

  const receiverList = receivers.map((receiver) => {
    return {
      id: receiver.id,
      name: receiver.name,
      type: receiver.type,
      addr: receiver.addr,
      token: receiver.token,
      created_at: receiver.created_at
    }
  })

  res.status(200).send(receiverList)
}

const receiversRouter = async (req, res) => {
  const groupID = parseInt(req.params.groupID)
  if (isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const receivers = await getReceiversbyGroupID(groupID)
  if (!receivers) {
    res.status(200).send([])
    return
  }

  const receiverList = receivers.map((receiver) => {
    return {
      id: receiver.id,
      name: receiver.name,
      type: receiver.type,
      addr: receiver.addr,
      token: receiver.token,
      created_at: receiver.created_at
    }
  })

  res.status(200).send(receiverList)
}

const deleteReceiverRouter = async (req, res) => {
  const receiverID = parseInt(req.params.receiverID)
  if (isNaN(receiverID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteReceiverbyID(receiverID)

  res.status(200).send({ result: 'success' })
}

const updateReceiverRouter = async (req, res) => {
  const receiverID = parseInt(req.params.receiverID)
  const name = req.body.name
  const type = req.body.type
  const addr = req.body.addr
  const token = req.body.token
  if (isNaN(receiverID) || !isString(name) || !isString(type) || !isString(addr) || !isString(token)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await updateReceiverbyID(receiverID, name, type, addr, token)

  res.status(200).send({ result: 'success' })
}

const createReceiverGroupRouter = async (req, res) => {
  const receiverID = req.body.receiverID
  const groupID = req.body.groupID
  if (!isNumber(receiverID) || !isNumber(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await insertReceiverGroup(receiverID, groupID)

  res.status(200).send({ result: 'success' })
}

const deleteReceiverGroupRouter = async (req, res) => {
  const receiverID = parseInt(req.params.receiverID)
  const groupID = parseInt(req.params.groupID)
  if (isNaN(receiverID) || isNaN(groupID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  await deleteReceivergroupbyIDs(receiverID, groupID)

  res.status(200).send({ result: 'success' })
}

export {
  createReceiverRouter,
  allReceiversRouter,
  receiversRouter,
  deleteReceiverRouter,
  updateReceiverRouter,
  createReceiverGroupRouter,
  deleteReceiverGroupRouter
}
