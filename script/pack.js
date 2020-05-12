const { resolve } = require('path')
const { readFileSync, writeFileSync } = require('fs')

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../dist')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

const packageJSON = JSON.parse(readFileSync(fromRoot('package.json')).toString())

const packageJSONRes = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  author: packageJSON.author,
  repository: packageJSON.repository,
  dependencies: packageJSON.dependencies
}
writeFileSync(fromOutput('package.json'), JSON.stringify(packageJSONRes))
