// @flow

import R from 'ramda'
import Maybe from 'data.maybe'
import conf from '../../config'
import * as Dynamodb from './dynamodb'
import model from '../model'
import utils from '../../lib/utils'

export const table = {
  edges: conf.get('table.edges.name') || 'cs-pub-workflow', //TODO take this out.
  name: conf.get('table.edges.name') || 'cs-pub-workflow',
  gsi: 'subscriber_state-modified-index',
  query: { limit: conf.get('table.edges.query.limit') }
}
export const asInsertParams = edge => {
  return {
    TableName: table.name,
    Item: {
      isrc: edge.isrc,
      state: edge.state,
      subscriber_state: `${edge.subscriber}.${edge.state}`,
      modified: edge.modified || Date.now(),
      modifiedISO: new Date().toISOString(),
      transitions: edge.transitions
    }
  }
}

const asBatchQuery = keys => {
  return {
    RequestItems: {
      'cs-publish-edges': {
        Keys: keys.subscribers.map(x => {
          return { isrc: keys.isrc, subscriber: x }
        }),
        ProjectionExpression: 'isrc, modified, #s, subscriber, transitions',
        ExpressionAttributeNames: { '#s': 'state' }
      }
    }
  }
}
export const isrcQuery = (isrc: string) => {
  return {
    Key: { isrc: isrc },
    TableName: table.name,
    ProjectionExpression: 'isrc, modified, #s, subscriber, transitions',
    ExpressionAttributeNames: { '#s': 'state' }
  }
}

export const isrcSubscriberQuery = (key: EdgeKeyFilter) => {
  return {
    Key: { isrc: key.isrc, subscriber: key.subscriber },
    TableName: table.name,
    ProjectionExpression: 'isrc, modified, #s, subscriber, transitions',
    ExpressionAttributeNames: { '#s': 'state' }
  }
}
// keys = {isrc: isrc, subscribers: []}
export const findIsrcSubscribers = db => keys =>
  R.compose(Dynamodb.batchGet(db), asBatchQuery)(keys)
    .then(x =>
      x.Responses[table.name].filter(d =>
        keys.subscribers.includes(d.subscriber)
      )
    )
    .then(e => (R.isNil(e) ? [] : e))

export const findEdge = db => (key: EdgeKey) =>
  R.compose(Dynamodb.get(db), isrcSubscriberQuery)(key).then(
    e => (R.isNil(e) ? [] : e)
  )

export const find = db => edgeQuery =>
  R.compose(Dynamodb.runQuery(db), Dynamodb.asGsiQuery(table))(edgeQuery)

export const temporalQuery = limit => temporalHigh => subscriber => {
  return {
    query: {
      key: ':s = subscriber and :_s = _state and :high > modified',
      value: {
        ':s': subscriber,
        ':_s': `${model.publication.state.ready}`,
        ':high': temporalHigh
      },
      limit: limit
    }
  }
}

export const insert = db => edge =>
  R.compose(Dynamodb.putItem(db), asInsertParams)(edge)

export const republishToReady = transitions =>
  R.append(
    {
      name: 'ready',
      from: 'republish',
      to: 'ready',
      ts: Date.now()
    },
    transitions.filter(
      x => !(x.name === 'republish' && typeof x.from != 'string')
    )
  )
