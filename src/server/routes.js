// @flow

const Router = require('koa-router')
import V from '../service'
import model from '../lib/model'
import Utils from '../lib/utils'
const koaBody = require('koa-body')
import Either from 'data.either'

export const routerWithAuth = new Router()
routerWithAuth
  .get('/status/:subscribe/:isrc', videoStatusReport)
  .post('/status/:subscriber/:isrc', koaBody(), videoStatus)
  .get('/:subscriber', readyToPublish)
  .patch('/video/:isrc', koaBody(), patchVideo)
  .get('/video/:isrc', koaBody(), videoByIsrc)
  .post('/', koaBody(), saveNode)

export const routerWithNoAuth = new Router()
routerWithNoAuth
  .get('/public/up/', up)
  .get('/public/ready', ready)
  .get('/public/buildInfo', buildInfo)

async function patchVideo(ctx) {
  const sideEffect = responseHandler(ctx)(
    await V.patchRouter(ctx.params.isrc)(ctx.request.body)
  )
  sideEffect()
}

async function videoByIsrc(ctx) {
  const sideEffect = responseHandler(ctx)(await V.videoByIsrc(ctx.params.isrc))
  sideEffect()
}

async function saveNode(ctx) {
  const sideEffect = responseHandler(ctx)(await V.saveNode(ctx.request.body))
  sideEffect()
}

async function videoStatusReport(ctx) {
  ctx.response.body = await V.statusReport
}

async function readyToPublish(ctx) {
  ctx.response.body = await V.readyToPublish(ctx)
}

async function videoStatus(ctx) {
  ctx.response.body = await V.statusRouter(ctx)
}

function up(ctx) {
  ctx.body = 'up'
}

function ready(ctx) {
  ctx.body = 'ready'
}

function buildInfo(ctx) {
  ctx.body = Utils.buildInfo
}

/** 
   koa.js overrides the @vevo.node-errors.statusCode when throwing Exception
**/
const responseHandler = ctx => response => () =>
  response.isLeft
    ? ctx.throw({ errWrapper: response.swap().get() })
    : (ctx.body = response.get())
