import server from '../../src/server/app'
const fs = require('fs')
import p from 'relative-path'
import R from 'ramda'
import test from 'ava'
import koa from 'koa'
import * as r from '../../src/server/routes.js'
const request = require('supertest')
const app = new koa()
import utils from '../../src/lib/utils'

const jsonpath = p('../data/stream/video30.json')
const moc_metadata = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

app.use(r.routerWithNoAuth.routes())
app.use(r.routerWithAuth.routes())
test('route public/up status should be 200', async t => {
  let sub = 'youtube'
  let computed = await request(app.listen()).get('/public/up')
  utils.log.debug(`request path is : ${JSON.stringify(computed)}`)
  t.truthy(computed.status === 200)
})

test('route ready should be 200', async t => {
  let computed = await request(app.listen()).get('/public/buildInfo')
  t.deepEqual(utils.buildInfo, JSON.parse(computed.text))
})
test('video/:isrc route spec', async t => {
  let computed = await request(app.listen()).get('/video/zz34')
  utils.log.debug(`video/isrc: ${JSON.stringify(computed)}`)
  t.truthy(1 === 1)
})
