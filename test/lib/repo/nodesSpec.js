const fs = require('fs')
import conf from '../../../src/config'
import * as DB from '../../../src/lib/repo/db'
import utils from '../../../src/lib/utils'
import * as Nodes from '../../../src/lib/repo/nodes'
import * as Dynamodb from '../../../src/lib/repo/dynamodb.js'
import p from 'relative-path'
import R from 'ramda'
import test from 'ava'
import * as Moc from '../../data/moc'
import * as Video from '../../../src/service/video'

const log = x => console.log(`${JSON.stringify(x)}`)
const jsonpath = p('../../data/stream/video30.json')
const moc_video = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

const nodeJsonPath = p('../../data/api/patch_video.json')
const mocNode = JSON.parse(fs.readFileSync(nodeJsonPath, 'utf8'))

const isrcList = [
  'UKTTT1716771',
  'USSM21600745',
  'DESJ91400892',
  'DESJ91500571'
]
test('dynamo asBatchQuery specs', t => {
  const computed = Nodes.asBatchQuery(isrcList)

  let actual = {
    RequestItems: {
      'cs-pub-videos': {
        Keys: [
          { isrc: 'UKTTT1716771' },
          { isrc: 'USSM21600745' },
          { isrc: 'DESJ91400892' },
          { isrc: 'DESJ91500571' }
        ],
        ProjectionExpression: 'video'
      }
    }
  }
  console.log(`----- ${JSON.stringify(computed)}`)
  t.deepEqual(computed, actual)
})
test.skip('dynamo query node specs', async t => {
  const computed = await Nodes.node(DB.dynamodb.INSTANCE())('USCJY1520062')

  utils.log.debug(`--- fetched-node: ${JSON.stringify(computed)}`)
  t.truthy(computed)
})

test.skip('mergeVideo specs for pub-existing videos', async t => {
  const isrc = 'USCJY1520062'
  let computed = await Nodes.mergePatchVideo(DB.dynamodb.INSTANCE())(
    R.merge({ isrc: isrc, video: mocNode })({
      foo: 'bar',
      created: '2016-07-18T16:19:47.987Z'
    })
  )
  utils.log.debug(`mergeVideo Existing: ${JSON.stringify(computed)}`)
  t.truthy(computed.isRight && computed.get().foo === 'bar')
})

test.skip('mergeVideo specs for pub-NON-existing videos', async t => {
  const isrc = 'zz1520062'
  let computed = await Nodes.mergePatchVideo(DB.dynamodb.INSTANCE())(
    R.merge({ isrc: isrc, video: { v1: 'v1' } })({
      isrc: 'test-isrc',
      foo: 'bar'
    })
  )
  utils.log.debug(`mergeVideo NON-Existing : ${JSON.stringify(computed)}`)
  t.truthy(computed.isLeft)
})
test.skip('node.SaveNode spec ', async t => {
  const computed = await Nodes.saveNode(DB.dynamodb.INSTANCE())(
    R.merge({ isrc: 'USWV21824125' }, mocNode)
  )
  utils.log.debug(`node saveNode response: ${JSON.stringify(computed)}`)
  // t.truthy(computed.get().TableName === 'cs-pub-videos')
  t.truthy(1 === 1)
})

test.skip('patchVideo specs for pub-existing videos', async t => {
  const isrc = 'USWV21824125'
  let payload = R.compose(
    R.merge({ isrc: isrc }),
    R.mergeDeepLeft({
      foo: 'bar',
      foo2: 'bar2',
      created: '3001-07-18T16:19:47.987Z'
    })
  )(mocNode)

  let computed = await Nodes.patchVideo(DB.dynamodb.INSTANCE())(payload)
  utils.log.debug(`mergeVideo Existing PAYLOAD: ${JSON.stringify(payload)}`)
  utils.log.debug(`patched PAYLOAD:  ${JSON.stringify(computed)}`)
  t.truthy(computed.isRight)
})
test.skip('video.patchVideo specs for pub-existing videos', async t => {
  const isrc = 'USWV21824125'
  let payload = R.compose(
    R.merge({ isrc: isrc }),
    R.mergeDeepLeft({
      foo: 'bar',
      foo2: 'bar2',
      created: '3001-07-18T16:19:47.987Z'
    })
  )(mocNode)

  let computed = await Video.patchRouter('USWV21824125')(mocNode)
  utils.log.debug(`patched PAYLOAD:  ${JSON.stringify(computed)}`)
  t.truthy(computed.isRight)
})
