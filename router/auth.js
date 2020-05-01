import { insertUser, getUserIDbyEmail, authUser } from '../module/storage'
import { passwordHash } from '../module/util'

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const signInRouter = async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!emailRegex.test(email) || password.length < 1) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const encryptedPassword = passwordHash(password, email)
  const id = await authUser(email, encryptedPassword)
  if (id === -1) {
    res.status(401).send({ error_type: 'SIGNIN_FAILED' })
    return
  }

  req.session.userID = id
  res.status(200).send({ result: 'success' })
}

const signUpRouter = async (req, res) => {
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password

  if (!emailRegex.test(email) || password.length < 6 || username.length < 1) {
    res.status(400).send({ error_type: 'INVALID_PARAMS' })
    return
  }

  const id = await getUserIDbyEmail(email)
  if (id !== -1) {
    res.status(409).send({ error_type: 'DUPLICATED_EMAIL' })
    return
  }

  const encryptedPassword = passwordHash(password, email)
  if (!await insertUser(email, username, encryptedPassword)) {
    res.status(500).send({ error_type: 'INTERNAL_ERROR' })
    return
  }

  req.session.userID = id
  res.status(200).send({ result: 'success' })
}

const logoutRouter = async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy(() => resolve())
  })

  res.status(200).send({ result: 'success' })
}

export { signInRouter, signUpRouter, logoutRouter }
