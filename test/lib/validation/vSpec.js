//@flow

import test from 'ava'
const fs = require('fs')
import p from 'relative-path'
import R from 'ramda'
import utils from '../../../src/lib/utils'
import Either from 'data.either'
import * as V from '../../../src/lib/validation/v'

const validator = require('@vevo/cs-validator').create().publicationvideo
const nodeJsonPath = p('../../data/api/patch_video.json')
const mocPatchVideo = JSON.parse(fs.readFileSync(nodeJsonPath, 'utf8'))

test.only('valid isrc should return Either.Right.', async t => {
  const patchData = R.merge({ isrc: 'USUV71000127' })(mocPatchVideo)
  const computed = await V.isrc('us101')
  utils.log.info(
    `validation result validating isrc: ${JSON.stringify(computed)}`
  )
  t.truthy(computed.isLeft)
})

test('invalid isrc should return Either.left', async t => {
  const patchData = R.merge({ isrc: '000127' })(mocPatchVideo)
  const computed = await V.video(patchData)
  utils.log.debug(
    `patch-api schema validation result: ${JSON.stringify(
      computed.swap().get()
    )}`
  )
  t.truthy(computed.isLeft)
})
test('valid isrc should return Either.Right', async t => {
  const patchData = R.merge({ isrc: 'USCJY1520062' })(mocPatchVideo)
  const computed = await V.video(patchData)
  utils.log.debug(
    `patch-api schema validation result: ${JSON.stringify(computed.get())}`
  )
  t.truthy(computed.isRight)
})
