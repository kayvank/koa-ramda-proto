// @flow
import * as winston from 'winston'
import conf from '../../config'

/**
 ** represents Logger
 * */
type Logger = {}

/**
 ** represents  service properties
 * */
type Service = {
  team: string,
  name: string,
  version: string,
  build: string
}
const thisService: Service = {
  team: conf.get('team.name'),
  name: conf.get('service.name'),
  version: conf.get('service.version'),
  build: conf.get('service.build_info.gittag')
}

/**
 ** application logger
 * */
export const logger: Logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      timestamp: true,
      json: true,
      label: thisService,
      level: conf.get('service.logLevel')
    })
  ],
  exitOnError: false
})
