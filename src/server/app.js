/**
 ** koa http server impl.
 **/
const koa = require('koa')
const bearerToken = require('koa-bearer-token')
const Router = require('koa-router')
const cors = require('koa-cors')

import * as model from '../lib/model'
import * as r from './routes.js'
import * as s from '../service'
import * as m from './middleware'
import config from '../config'
import utils from '../lib/utils'
const VevoError = require('@vevo/node-errors')

const app = new koa()

/**
 ** handles all failures
 * */
app.use(async (ctx, next) => {
  await next()
  ctx.set('Access-Control-Allow-Methods', ['GET', 'PUT', 'POST', 'PATCH'])
})
app.use(new cors())
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    utils.log.error(`err.stringify = ${JSON.stringify(err)}`)
    ctx.status = err.errWrapper.statusCode || 500
    ctx.body = err.errWrapper.message
    ctx.set('X-Vevo-Media-Type', 'v1.1')
    ctx.set('Content-Type', 'application/json')
    m.report(ctx)
  }
})
app.use(r.routerWithNoAuth.routes())
// app.use(m.auth()) //TODO uncommment
app.use(r.routerWithAuth.routes()).use(r.routerWithAuth.allowedMethods())

app.use(async (ctx, next) => {
  const apiHeader = `application/vnd.vevo.${config.get('service.name')}.v1+json`
  if (!ctx.request.accepts(apiHeader)) ctx.throw(406, 'incorrect headers')
  await next()
})
app.use(async (ctx, next) => {
  await next()
  m.report(ctx)
})
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  ctx.set('X-Vevo-Media-Type', 'v1.1')
  ctx.set('Content-Type', 'application/json')
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  m.responseTime(ms, ctx) //* * record response time
})
const server = app.listen(3000)
module.exports = server // used for unit test
