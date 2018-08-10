import test from 'ava'
import * as v from '../../../src/service/video'
import * as WFR from '../../../src/lib/repo/wfRouter.js'
import * as ED from '../../../src/lib/repo/edgesDynamo.js'
import model from '../../../src/lib/model'
import * as DB from '../../../src/lib/repo/db'
import * as Dynamodb from '../../../src/lib/repo/dynamodb'
import R from 'ramda'
import * as Moc from '../../data/moc'
import utils from '../../../src/lib/utils'

const transitions = [
  { name: 'ready', from: 'init', to: 'ready', ts: 12344 },
  { name: 'processing', from: 'ready', to: 'processing', ts: 12347 },
  { name: 'republish', ts: 12349 },
  { name: 'completed', from: 'processing', to: 'completed', ts: 12351 }
]
const mocVideo = { isr: '123' }

test('Receiving patch for assets in ready state will results refreshing the modified timestamp', t => {
  const mocEdge = {
    isrc: 'test-isrc',
    modified: 1234,
    subscriber: 'youtube',
    state: 'ready',
    transitions: [transitions[0]]
  }
  let computed = WFR.existingWfRouter(mocEdge)
  utils.log.debug(
    `wf-router-spec.update-timestamp on read state ----  ${JSON.stringify(
      computed
    )}`
  )
  t.truthy(
    !R.isNil(computed.modified) && R.compose(R.Not, R.equals(mocEdge.modified))
  )
})
test('Receiving patch for assets in completed state will transition asset to republish', t => {
  const mocEdge = {
    isrc: 'test-isrc',
    modified: 1234,
    subscriber: 'youtube',
    state: 'completed',
    transitions: [transitions[0], transitions[1], transitions[3]]
  }
  let computed = WFR.existingWfRouter(mocEdge)
  utils.log.debug(
    `wf-router-spec.transition from completed to republish. ${JSON.stringify(
      computed
    )}`
  )
  t.truthy(
    computed.transitions[0]['name'] === model.publication.state.republish &&
      computed.transitions[0]['from'] === model.publication.state.completed &&
      computed.transitions[0]['to'] === model.publication.state.republish &&
      computed.state === model.publication.state.ready
  )
})
test('Receiving patch for assets in processing state will transition asset to republish as an orphan edge.  Orphan edges are those with no -- from -- to --', t => {
  const mocEdge = {
    isrc: 'test-isrc',
    modified: 1234,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [transitions[0], transitions[1]]
  }
  let computed = WFR.existingWfRouter(mocEdge)
  utils.log.debug(
    `wf-router-spec.transition from processing to republish as orphan. ${JSON.stringify(
      computed
    )}`
  )
  t.truthy(
    computed.transitions[0]['name'] === model.publication.state.republish &&
      computed.state === mocEdge.state
  )
})
/**
 ** run this test to visually inspect dynamo
 ** TODO move such tests to integration
 **/
test('router test against dynamodb for new edge', async t => {
  const isrc = 'GB1101100210'
  const computed = await WFR.wfRouter(DB.dynamodb.INSTANCE())(isrc)
  utils.log.info(`wfrouter-test, newEdge = ${JSON.stringify(computed)}`)
  t.truthy(1 === 1)
})
test('router test against dynamodb, existing edge', t => {
  const testEdge = {
    isrc: 'test-isrc-333',
    state: model.publication.state.init,
    modified: 123,
    subscriber: 'not-yet-known',
    transitions: []
  }
  const computed = WFR.existingWfRouter(testEdge)
  utils.log.info(`wfrouter-test, existingEdge  = ${JSON.stringify(computed)}`)
  t.truthy(
    computed.isrc === testEdge.isrc &&
      computed.subscriber === model.subscribers.unknown
  )
})

test('route publish-error status', t => {
  const mocStatus = {
    isrc: 'isrc-123',
    status: 'error',
    subscriber: 'vvevo'
  }
  const mocEdge = {
    isrc: 'test-isrc',
    modified: 1234,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [transitions[0], transitions[1], transitions[3]]
  }
  const computed = WFR.statusWfRouter(mocEdge)(mocStatus)
  utils.log.debug(
    `statusWfrouter publish-error-test: ${JSON.stringify(computed)}`
  )
  t.truthy(
    computed.transitions[0]['name'] === model.publication.state.error &&
      computed.state === model.publication.state.error &&
      computed.modified != mocEdge.modfied
  )
})
test('route publish-completed status', t => {
  const mocStatus = {
    isrc: 'isrc-123',
    status: 'completed',
    subscriber: 'vvevo'
  }
  const mocEdge = {
    isrc: 'test-isrc',
    modified: 1234,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [transitions[0], transitions[1], transitions[3]]
  }
  const computed = WFR.statusWfRouter(mocEdge)(mocStatus)
  utils.log.debug(
    `statusWfrouter completed-status-test: ${JSON.stringify(computed)}`
  )
  t.truthy(
    computed.transitions[0]['name'] === model.publication.state.completed &&
      computed.state === model.publication.state.completed &&
      computed.modified != mocEdge.modfied
  )
})
test.skip('route publish-completed status test against dynamo', async t => {
  const mocStatus = {
    isrc: 'GB1101100210',
    status: 'error',
    subscriber: 'youtube'
  }
  const mocEdge = {
    isrc: 'GB1101100210',
    modified: 1234,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [transitions[0], transitions[1], transitions[3]]
  }
  const computed = await WFR.statusRouter(DB.dynamodb.INSTANCE())(mocStatus)
  utils.log.info(
    `statusrouter test against dynamo : ${JSON.stringify(computed)}`
  )
  t.truthy(1 == 0)
})
