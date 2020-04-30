import { getUserInfobyID } from '../module/storage'
import { isNumber } from '../module/util'

const selfRouter = async (req, res) => {
  if (!isNumber(req.session.userID) || req.session.userID === -1) {
    res.status(401).send({ error_type: 'UNAUTHORIZED' })
    return
  }

  const info = await getUserInfobyID(req.session.userID)
  if (!info) {
    await new Promise((resolve, reject) => {
      req.session.destroy(() => resolve())
    })
    res.status(401).send({ error_type: 'UNAUTHORIZED' })
    return
  }

  res.status(200).send({
    email: info.email,
    username: info.username
  })
}

export { selfRouter }
