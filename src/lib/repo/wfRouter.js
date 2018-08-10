// @flow

import R from 'ramda'
import conf from '../../config'
import * as D from './dynamodb'
import model from '../model'
import * as ED from './edgesDynamo'
import * as Types from '../model/types'
import * as WF from './wf.js'
const VevoError = require('@vevo/node-errors')
import Either from 'data.either'
import Utils from '../../lib/utils'

export const wfRouter = (db: Types.Connection) => (isrc: string) => {
  const f = x => R.compose(WF.runPut(db), R.tap(Utils.logInfo), newEdge)(isrc)

  const g = z =>
    R.compose(WF.runPut(db), R.tap(Utils.logInfo), existingWfRouter)(z)

  return WF.runIsrcTemporalQuery(db)(isrc)({ initial: 0, final: Date.now() })
    .then(e => e.fold(f, g))
    .catch(e => Either.Left(VevoError.unknownException(e)))
}
export const existingWfRouter = (e: Types.Edge) => {
  const f = R.cond([
    [R.equals(model.publication.state.completed), R.always(republish(e))],
    [R.equals(model.publication.state.error), R.always(republish(e))],
    [R.equals(model.publication.state.ready), R.always(updateTimestamp(e))],
    [R.equals(model.publication.state.init), R.always(updateTimestamp(e))],
    [R.equals(model.publication.state.processing), R.always(orphanRepublish(e))]
  ])
  return f(e.state)
}

export const newEdge = isrc => {
  return {
    isrc: isrc,
    subscriber: model.subscribers.unknown,
    modified: Date.now(),
    state: model.publication.state.init,
    transitions: []
  }
}

const toReadyTransition = {
  name: model.publication.state.ready,
  from: model.publication.state.init,
  to: model.publication.state.ready,
  ts: Date.now()
}

export const updateTimestamp = (initEdge: Types.Edge) =>
  R.set(R.lensProp('modified'), Date.now())(initEdge)

const orphanRepublish = (e: Types.Edge) => {
  const __transtions = R.compose(
    R.insert(0, {
      name: model.publication.state.republish,
      ts: Date.now()
    }),
    R.prop('transitions')
  )(e)
  return R.compose(
    R.set(R.lensProp('modified'), Date.now()),
    R.set(R.lensProp('transitions'), __transtions)
  )(e)
}

const republish = (e: Types.Edge) => {
  const __transtions = R.compose(
    R.insert(0, {
      name: model.publication.state.republish,
      from: model.publication.state.completed,
      to: model.publication.state.republish,
      ts: Date.now()
    }),
    R.prop('transitions')
  )(e)

  return R.compose(
    R.set(R.lensProp('state'), model.publication.state.ready),
    R.set(R.lensProp('modified'), Date.now()),
    R.set(R.lensProp('transitions'), __transtions)
  )(e)
}

export const subscribers = (isrc: string) =>
  Promise.resolve(Either.Right(model.subscribers.unknown))

const completed = (e: Types.Edge) => {
  const __transtions = R.compose(
    R.insert(0, {
      name: model.publication.state.completed,
      from: model.publication.state.processing,
      to: model.publication.state.completed,
      ts: Date.now()
    }),
    R.prop('transitions')
  )(e)

  return R.compose(
    R.set(R.lensProp('state'), model.publication.state.completed),
    R.set(R.lensProp('modified'), Date.now()),
    R.set(R.lensProp('transitions'), __transtions)
  )(e)
}
/**
 ** TODO have to save error json here
 **/
const error = (e: Types.Edge) => {
  const __transtions = R.compose(
    R.insert(0, {
      name: model.publication.state.error,
      from: model.publication.state.processing,
      to: model.publication.state.error,
      ts: Date.now()
    }),
    R.prop('transitions')
  )(e)

  return R.compose(
    R.set(R.lensProp('state'), model.publication.state.error),
    R.set(R.lensProp('modified'), Date.now()),
    R.set(R.lensProp('transitions'), __transtions)
  )(e)
}
const processing = (e: Types.Edge) => {
  const __transtions = R.compose(
    R.insert(0, {
      name: model.publication.state.processing,
      from: model.publication.state.ready,
      to: model.publication.state.processing,
      ts: Date.now()
    }),
    R.prop('transitions')
  )(e)

  return R.compose(
    R.set(R.lensProp('state'), model.publication.state.processing),
    R.set(R.lensProp('modified'), Date.now()),
    R.set(R.lensProp('transitions'), __transtions)
  )(e)
}

export const statusWfRouter = (e: Types.Edge) => (s: Types.PubStatus) => {
  const f = R.cond([
    [R.equals(model.publication.state.completed), R.always(completed(e))],
    [R.equals(model.publication.state.processing), R.always(processing(e))],
    [R.equals(model.publication.state.error), R.always(error(e))]
  ])
  return f(s.status)
}

export const statusRouter = (db: Types.Connection) => (ps: Types.PubStatus) => {
  return ED.findEdge(db)({ isrc: ps.isrc, subscriber: ps.subscriber })
    .then(e => statusWfRouter(e)(ps))
    .then(e => ED.insert(db)(e))
}
