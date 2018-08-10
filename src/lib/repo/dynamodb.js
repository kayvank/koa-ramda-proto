import Maybe from 'data.maybe'
import R from 'ramda'
import utils from '../utils'
import conf from '../../config'

const warnLog = x => utils.log.warn(`${JSON.stringify(x)}`)
const debugLog = x => utils.log.debug(`${JSON.stringify(x)}`)

const limit = conf.get('table.edges.query.limit')

export const putItem = db => param =>
  new Promise((resolve, reject) =>
    db.put(param, (err, data) => (err ? reject(err) : resolve(data)))
  )

export const runQuery = db => q =>
  new Promise((resolve, reject) =>
    db.query(
      q,
      (err, data) =>
        err
          ? R.compose(reject, R.tap(warnLog))(err)
          : R.compose(resolve, R.prop('Items'))(data)
    )
  )
export const asGetQuery = (tableName: string) => (projection: string) => (
  isrc: string
) => {
  return {
    TableName: tableName,
    Key: {
      isrc: isrc
    },
    ProjectionExpression: projection
  }
}

export const get = db => q =>
  new Promise((resolve, reject) =>
    db.get(q, (err, data) => (err ? reject(err) : resolve(data.Item)))
  )
export const batchGet = db => q =>
  new Promise((resolve, reject) =>
    db.batchGet(q, (err, data) => (err ? reject(err) : resolve(data)))
  )

export const runBatchQuery = db => q =>
  new Promise((resolve, reject) =>
    db.batchGetItem(q, (err, data) => (err ? reject(err) : resolve(data)))
  )
export const asGsiQuery = table => exp => {
  return {
    TableName: table.name,
    IndexName: table.gsi,
    Limit: exp.query.limit,
    KeyConditionExpression: exp.query.key,
    ExpressionAttributeValues: exp.query.value
  }
}
