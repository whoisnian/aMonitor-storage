import { getUserInfobyID } from '../module/storage'

const selfRouter = async (req, res) => {
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
