import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { logger } from './logger'

const isPidExist = (pid) => {
  try {
    // This method will throw an error if the target pid does not exist. As a special case, a signal of 0 can be used to test for the existence of a process.
    // https://nodejs.org/api/process.html#process_process_kill_pid_signal
    // https://www.npmjs.com/package/is-running

    // pid不存在时或者对进程权限不足时，均会抛出异常
    // http://man7.org/linux/man-pages/man2/kill.2.html#ERRORS
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error.code === 'EPERM') {
      logger.warn('No permission to send the signal.')
    } else if (error.code === 'ESRCH') {
      logger.warn('Can not find process or process group.')
    } else {
      logger.warn(error)
    }
    return false
  }
}

const EXIT_EVENTS = ['exit', 'uncaughtException', 'unhandledRejection', 'SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGTERM']

const configurePid = (pidPath) => {
  if (!pidPath) return

  // 若存在pid文件且pid文件中指定进程存在，则说明该服务已在运行，当前进程主动退出
  if (existsSync(pidPath)) {
    const existingPid = Number(String(readFileSync(pidPath)).trim())
    if (existingPid && isPidExist(existingPid)) {
      logger.warn(`Find existing pid: ${existingPid}, exit process...`)
      process.exit(-1)
    }
  }

  // 否则将当前进程pid写入文件
  if (!existsSync(dirname(pidPath))) {
    mkdirSync(dirname(pidPath), { recursive: true })
  }
  writeFileSync(pidPath, `${process.pid}`)

  // 通过添加event listener在程序退出时删除pid文件
  const listener = function (event) {
    logger.info('Delete pid file.')
    if (existsSync(pidPath)) unlinkSync(pidPath)
    EXIT_EVENTS.forEach(e => process.off(e, listener))
    process.exit(event)
  }
  EXIT_EVENTS.forEach(e => process.on(e, listener))
}

export { configurePid }
