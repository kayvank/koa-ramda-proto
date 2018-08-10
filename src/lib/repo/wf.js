// @flow

import R from 'ramda'
import conf from '../../config'
import * as Dynamodb from './dynamodb'
import Model from '../model'
import * as Types from '../model/types'
import Either from 'data.either'
import Utils from '../../lib/utils'
const VevoError = require('@vevo/node-errors')

const table = {
  name: conf.get('table.edges.name') || 'cs-pub-workflow',
  gsi: conf.get('table.edges.gsi.name') || 'SubscriberPubStateNdx2',
  query: { limit: conf.get('table.edges.query.limit') }
}
export const wfGsiQuery = exp => Dynamodb.asGsiQuery(table)(exp)

export const isrcTemporalQuery = isrc => temporal => {
  return {
    query: {
      key: ':i = isrc and  modified between :initial and :final',
      value: {
        ':i': isrc,
        ':initial': temporal.initial,
        ':final': temporal.final
      }
    }
  }
}
export const runIsrcTemporalQuery = (db: Types.Connection) => (
  isrc: string
) => (temporal: Types.Range) =>
  R.compose(
    Dynamodb.runQuery(db),
    R.tap(Utils.logInfo),
    wfGsiQuery,
    isrcTemporalQuery(isrc)
  )(temporal)
    .then(
      w =>
        R.isEmpty(w)
          ? Either.Left(VevoError.notFoundException(`${isrc}`))
          : Either.Right(R.head(w))
    )
    .catch(e => Either.Left(VevoError.unknownException(e)))

export const asPut = (edge: Types.Edge) => {
  return {
    TableName: table.name,
    Item: {
      isrc: edge.isrc,
      state: edge.state,
      subscriber: edge.subscriber,
      transitions: edge.transitions,
      modified: edge.modified || Date.now(),
      modifiedISO: edge.modifiedISO || new Date().toISOString()
    }
  }
}
export const runPut = (db: Types.Connection) => (edge: Types.Edge) =>
  R.compose(Dynamodb.putItem(db), R.tap(Utils.logMe), asPut)(edge)
    .then(w => Either.Right(w))
    .catch(e => Either.Left(e))
