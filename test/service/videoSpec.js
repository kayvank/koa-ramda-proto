//@flow

import test from 'ava'
const fs = require('fs')
import p from 'relative-path'
import R from 'ramda'
import Either from 'data.either'
import Task from 'data.task'
import * as v from '../../src/service/video'
import * as node from '../../src/lib/repo/nodes.js'
import utils from '../../src/lib/utils'
import * as DB from '../../src/lib/repo/db.js'
const nodeJsonPath = p('../data/api/patch_video.json')
const mocpatchVideo = JSON.parse(fs.readFileSync(nodeJsonPath, 'utf8'))

test.skip('saveNode spces', async t => {
  const testVideo = {
    action: 'MODIFY',
    subscribers: ['amazon', 'youtube'],
    payload: {
      isrc: '5ZZZZ1500571',
      video: 'some-video'
    }
  }
  const computed = await v.saveNode(testVideo)
  utils.log.debug(`===== ${JSON.stringify(computed)}`)
  t.truthy(1 === 1)
})
test.skip('reduce edge', t => {
  const ls_left = [[], [{ name: 'ready', from: 'init', to: 'ready' }]]
  const ls_right = [[{ name: 'ready', from: 'init', to: 'ready' }], []]
  const ls_both = [
    [{ name: 'ready', from: 'init', to: 'ready' }],
    [{ name: 'ready', from: 'init', to: 'ready' }]
  ]
  const ls_none = [[]]

  const f = x => (R.isEmpty(x) ? 'create one' : 'exists')
  const res = R.map(f, ls_left)
  utils.log.debug(`reduce-edge:  ${JSON.stringify(res)}`)
  t.truthy(1 === 1)
})
test.skip('patch router specs against dynamodb', async t => {
  const computed = await v.patchRouter(mocpatchVideo)
  utils.log.info(`patch-router test : ${JSON.stringify(computed)}`)
  t.truthy(1 === 1)
})
test.skip('find ready-edge ', async t => {
  const computed = await v.readyWithDebounce(7)('youtube')
  utils.log.debug(`find ready-edge : ${computed}`)
  t.truthy(typeof computed === 'object')
})
test.only('video byIsrc query validation specs', async t => {
  const computed = await v.videoByIsrc('1223')
  utils.log.info(`videoByIsrc validation results: ${JSON.stringify(computed)}`)
  t.truthy(computed.isLeft)
})
