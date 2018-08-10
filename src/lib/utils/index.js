// @flow

import * as log from './logger'
import * as model from '../model'
import R from 'ramda'
import conf from '../../config'
const schemas = require('@vevo/payload_schemas')

export const buildInfo = {
  build_version: conf.get('service.build_info.build_version'),
  gittag: conf.get('service.build_info.gittag'),
  status: 'up'
}

const logInfo = x => log.logger.info(`${JSON.stringify(x)}`)
const logMe = x => log.logger.debug(`${JSON.stringify(x)}`)
const isEmpty = (obj: any) => Object.keys(obj).length === 0
const dot = R.curry((prop, obj) => obj[prop])
const trace = R.curry((tag, x) => {
  log.logger.info(`${tag}; ${x}`)
  return x
})

const isSublist = bigList => smallList =>
  R.compose(
    R.equals(R.length(smallList)),
    R.length,
    R.reduce(
      (acc, value) => (R.contains(value, bigList) ? R.append(value, acc) : acc),
      []
    )
  )(smallList)

const hasSublist = pubs => nodes =>
  R.reduce(
    (acc, value) => (R.contains(value.isrc, pubs) ? R.append(value, acc) : acc),
    [],
    nodes
  )

const partition = f => nodes => (...sublists) =>
  R.reduce((acc, value) => R.append(f(value)(nodes), acc), [], sublists)

const videoSchema = conf.get('schema.pub.api.video')
const schemaValidator = schema => json =>
  new Promise((resolve, reject) =>
    schemas.validate(schema, json, err => (err ? reject(err) : resolve(json)))
  )
const videoValidator = json => schemaValidator(videoSchema)(json)

module.exports = {
  isEmpty: isEmpty,
  buildInfo: buildInfo,
  log: log.logger,
  withLogger: log.withLogger,
  trace: trace,
  hasSublist: hasSublist,
  logMe: logMe,
  logInfo: logInfo,
  partition: partition,
  videoValidator: videoValidator
}
