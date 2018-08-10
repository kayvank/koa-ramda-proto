//@flow

import test from 'ava'
const fs = require('fs')
import p from 'relative-path'
import R from 'ramda'
import * as v from '../../../src/service/video.js'
import * as node from '../../../src/lib/repo/nodes.js'
import utils from '../../../src/lib/utils'
import * as DB from '../../../src/lib/repo/db.js'
import Either from 'data.either'
const validator = require('@vevo/cs-validator').create().publicationvideo

const nodeJsonPath = p('../../data/api/patch_video.json')
const mocPatchVideo = JSON.parse(fs.readFileSync(nodeJsonPath, 'utf8'))

test('partition lists in 3', t => {
  const v0 = [
    { isrc: 0 },
    { isrc: 1 },
    { isrc: 2 },
    { isrc: 3 },
    { isrc: 4 },
    { isrc: 5 },
    { isrc: 6 },
    { isrc: 7 },
    { isrc: 8 },
    { isrc: 9 }
  ]
  const v1 = [3, 4]
  const v2 = [5, 8]
  const v3 = [1, 2]
  const v4 = [11, 23]
  const computed2 = utils.partition(utils.hasSublist)(v0)(v2, v3)
  const computed1 = utils.partition(utils.hasSublist)(v0)(v2)
  const computed0 = utils.partition(utils.hasSublist)(v0)(v4, v3)
  t.truthy(R.length(computed1) === 1)
  t.truthy(R.length(computed2) === 2)
})
test('compose equals', t => {
  const v1 = [
    { isrc: 1 },
    { isrc: 2 },
    { isrc: 3 },
    { isrc: 4 },
    { isrc: 5 },
    { isrc: 6 },
    { isrc: 7 },
    { isrc: 8 },
    { isrc: 9 }
  ]
  const v2 = [3, 4]
  const v3 = [5, 8]
  const v4 = [50, 80]
  const v5 = [50, 8]
  let c2 = utils.hasSublist(v2)(v1)
  let c3 = utils.hasSublist(v3)(v1)
  let c4 = utils.hasSublist(v4)(v1)
  let c5 = utils.hasSublist(v5)(v1)
  t.truthy(R.length(c2) === R.length(v2))
  t.truthy(R.length(c3) === R.length(v3))
  t.truthy(R.length(c4) === 0)
  t.truthy(R.length(c5) === 1)
})
test.only('either fold spec', t => {
  let l = Either.Left({ a: 2 })
  let r = Either.Right({ b: 3 })
  let f = _ => 24
  let g = x => x.b * 30
  let retL = l.fold(f, g)
  let retR = r.fold(f, g)
  t.truthy(retL === f({ a: 2 }) && retR === g({ b: 3 }))
})
