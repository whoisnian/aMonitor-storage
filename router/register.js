import { config } from '../module/config'
import { registerAgent } from '../module/storage'
import { isString, isHexString, tokenEncode } from '../module/util'

const registerRouter = async (req, res) => {
  // man 5 machine-id
  // The machine ID is a single newline-terminated, hexadecimal, 32-character, lowercase ID.
  const machineID = req.body.MachineID
  if (!isString(machineID) || machineID.length !== 32 || !isHexString(machineID)) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  // 生成一个尚未使用的token并注册agent
  let token
  do {
    token = tokenEncode(machineID, config.secret)
  } while (!await registerAgent(token))

  res.json({ Token: token })
}

export { registerRouter }
