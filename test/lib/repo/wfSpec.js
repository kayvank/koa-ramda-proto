import test from 'ava'
import * as WF from '../../../src/lib/repo/wf.js'
import * as WFR from '../../../src/lib/repo/wfRouter.js'
import Model from '../../../src/lib/model'
import * as DB from '../../../src/lib/repo/db'
import * as Dynamodb from '../../../src/lib/repo/dynamodb'
import R from 'ramda'
import * as Moc from '../../data/moc'
import Utils from '../../../src/lib/utils'

test('workflow find by isrc query spec', async t => {
  const isrc = 'isrc-123'
  const computed = await WF.runIsrcTemporalQuery(Moc.mocDb)(isrc)({
    final: Date.now(),
    initial: 0
  })
  Utils.log.debug(`findByIsrc moc test: ${JSON.stringify(computed)}`)
  t.truthy(computed.isRight && computed.get().TableName === 'cs-pub-workflow')
})
test('workflow temporal isrc query  spec', async t => {
  const isrc = 'ZZZZ71600154'
  const temporalRange = { final: Date.now(), initial: 0 }
  const computed = await WF.runIsrcTemporalQuery(DB.dynamodb.INSTANCE())(isrc)(
    temporalRange
  )
  Utils.log.info(`temporal isrc spec: ${JSON.stringify(computed)}`)
  t.truthy(computed.isLeft)
})
test('workflow insert new edge parameters spec', t => {
  const computed = R.compose(WF.asPut, WFR.newEdge)('test-isrc-123')
  Utils.log.debug(`workflow edge parameters : ${JSON.stringify(computed)}`)
  t.truthy(computed.TableName === 'cs-pub-workflow')
})
test('workflow insert new edge spec', async t => {
  const computed = await R.compose(WF.runPut(Moc.mocDb), WFR.newEdge)(
    'test-isrc-123'
  )

  Utils.log.debug(`workflow edge parameters : ${JSON.stringify(computed)}`)
  t.truthy(computed.isRight)
})
