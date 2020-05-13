import { setPreference, getAllPreferences, getPreference } from '../module/storage'

const allPreferencesRouter = async (req, res) => {
  const preferences = await getAllPreferences()
  if (!preferences) {
    res.status(200).send(null)
    return
  }

  const obj = {}
  preferences.forEach((preference) => {
    if (['forbidSignUp'].includes(preference.key)) {
      obj[preference.key] = preference.value
    }
  })
  res.status(200).send(obj)
}

const preferenceRouter = async (req, res) => {
  const key = req.query.key

  const value = await getPreference(key)

  res.status(200).send({ value })
}

const updatePreferenceRouter = async (req, res) => {
  const key = req.body.key
  const value = req.body.value

  await setPreference(key, value)

  res.status(200).send({ result: 'success' })
}

export {
  allPreferencesRouter,
  preferenceRouter,
  updatePreferenceRouter
}
