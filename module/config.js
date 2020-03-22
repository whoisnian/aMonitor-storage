import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { logger } from './logger'
import { configurePid } from './pid'

// 默认配置文件 config/config.json
let configPath = resolve(__dirname, '../config/config.json')

// 如果在 AMONITOR_STORAGE_CONFIG 环境变量中指定了配置文件，则选择指定的配置文件
if (process.env.AMONITOR_STORAGE_CONFIG !== undefined && process.env.AMONITOR_STORAGE_CONFIG !== '') {
  configPath = resolve(process.env.AMONITOR_STORAGE_CONFIG)
}

// 使用命令行参数 -c 指定配置文件路径
for (let i = 2; i < process.argv.length - 1; i++) {
  if (process.argv[i] === '-c') {
    i++
    configPath = resolve(process.argv[i])
  }
}

const config = JSON.parse(readFileSync(configPath).toString())

logger.setDebug(config.debug)
logger.info('Load config file from ' + configPath)

configurePid(resolve(dirname(configPath), config.pidPath))

export { config }
