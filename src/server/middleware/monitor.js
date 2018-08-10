// @flow

const StatsD = require('node-dogstatsd').StatsD
import * as conf from '../../config.js'
import * as utils from '../../lib/utils'
/**
 ** represents koa http context
 **/
type HttpContext = {}

/**
 ** statsD object used for monitoring
 ** see {@link https://github.com/sivy/node-statsd}
 **/

const serviceName = conf.get('service.name')
const statsdClient = () => {
  const [host, port] = [conf.get('service.statsD.host'), conf.get('service.statsD.port')]
  const ddTag = [{
    service: conf.get('service.name')
  }, {
    application: conf.get('service.name')
  }, {
    env: conf.get('service.statsD.tag')
  }, {
    version: conf.get('service.version')
  }]

  //utils.log.info(`datadog configurations: ${JSON.stringify(ddTag)}`)
  return new StatsD(
    conf.get('service.statsD.host'),
    conf.get('service.statsD.port'),
    void(0), {
      global_tags: JSON.stringify(ddTag)
    })
}

const client = statsdClient()

/**
 ** statdsD http status counter 
 ** @param {number} http status code
 ** @returns {void} nothing
 **/
export const report: HttpContext => void = (ctx) => {
  switch (ctx.status) {
    case 200:
    case 204:
      {
        incCounter(200, ctx)
        break
      }
    case 400:
    case 401:
    case 402:
    case 403:
    case 404:
      {
        incCounter(400, ctx)
        break
      }
    case 500:
      {
        incCounter(500, ctx)
        break
      }
    default:
      incCounter('unknow-error', ctx)
  }
}

/**
 ** is this an http get operation
 ** @param {@HttpContext} http context
 ** @returns  {Boolean}
 **/
const isGet: HttpContext => boolean =
  (ctx) => (ctx.method.toLowerCase() === 'get')

/**
 ** is this an http get operation on /video url
 ** @param {@HttpContext} http context
 ** @returns  {Boolean}
 **/
const isGetVideo: HttpContext => boolean =
  (ctx) => ctx.path.includes('video') && isGet(ctx)

/**
 ** is this an http get operation on /artist url
 ** @param {@HttpContext} http context
 ** @returns  {Boolean}
 **/
const isGetArtist: HttpContext => boolean =
  (ctx) => ctx.path.includes('artist') && isGet(ctx)

/**
 ** is this status in the  valid http  range
 ** @param {number} http status
 ** @returns  {Boolean}
 **/
const isInValidRange: number => boolean =
  (http_status) => (200 <= http_status < 400)

/**
 ** is this an http success response
 ** @param {number} http context
 ** @returns  {Boolean}
 **/
const isValidResponse: number => boolean =
  (http_status) => isInValidRange(http_status)

/**
 ** statdsD response time for this http request/response
 ** @param {number} mils number of milliseconds 
 ** @returns {number} milliseconds
 **/
export const responseTime = (mils: number, ctx: any) => {
  isValidResponse(ctx.status) &&
    isGetArtist(ctx) &&
    client.timing(`${serviceName}_${ctx.method}_artist`, mils)
  isValidResponse(ctx.status) &&
    isGetVideo(ctx) &&
    client.timing(`${serviceName}_${ctx.method}_video`, mils)
  return mils
}

/**
 ** increment statdsD-metric counter
 ** @param {HttpContext}  http context
 ** @returns {void} nothing
 **/
const incCounter = (status: number | string, ctx: any) => {
  isGetArtist(ctx) && client.increment(`${serviceName}${ctx.method}_artist_${status} `)
  isGetVideo(ctx) && client.increment(`${serviceName}_${ctx.method}_video_${status} `)
}
