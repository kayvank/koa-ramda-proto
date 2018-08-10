import conf from '../../config'
import * as Dynamodb from './dynamodb'
import * as Types from '../model/types'
import R from 'ramda'
import Utils from '../utils'
const VevoError = require('@vevo/node-errors')
import Either from 'data.either'
import * as Validate from '../validation/v'

const table = { name: conf.get('table.nodes.name') || 'cs-pub-videos' }
const isDelete = x => x.action.toLowerCase() == 'delete'

export const asBatchQuery = isrcList => {
  return {
    RequestItems: {
      'cs-pub-videos': {
        Keys: isrcList.map(x => {
          return { isrc: x }
        }),
        ProjectionExpression: 'video'
      }
    }
  }
}

export const asQuery = isrcList => {
  return {
    RequestItems: {
      'cs-pub-videos': {
        Keys: isrcList.map(x => {
          return { isrc: x }
        }),
        ProjectionExpression: 'video'
      }
    }
  }
}
const videoProjection = 'video'

const queryByIsrc = (isrc: string) =>
  Dynamodb.asGetQuery(table.name)(videoProjection)(isrc)

export const node = (db: Types.connection) => (isrc: string) =>
  R.compose(Dynamodb.get(db), R.tap(Utils.logMe), queryByIsrc)(isrc).then(
    x =>
      R.isNil(x)
        ? Either.Left(VevoError.notFoundException())
        : Either.Right(x.video)
  )

export const nodes = db => isrcList =>
  R.compose(Dynamodb.batchGet(db), asBatchQuery)(isrcList)
    .then(x => Either.Right(x.Responses[table.nodes]))
    .catch(e => Either.Left(e))

const asPatchParam = (v: Types.Video) => {
  return {
    TableName: table.name,
    Item: {
      isrc: v.isrc,
      modfied: Date.now(),
      modfiedIso: new Date().toISOString(),
      video: v
    }
  }
}

export const mergeVideos = v1 => v2 => R.mergeDeepLeft(v1)(v2)

export const addCreated = (v: Types.Video) =>
  R.compose(R.isNil, R.prop('created'))(v)
    ? R.assoc('created', new Date().toISOString(), v)
    : v

export const mergePatchVideo = (video: Types.Video) =>
  node(db)(video.isrc)
    .then(
      v =>
        v.isRight
          ? v.map(_v => R.compose(addCreated, mergeVideos(video))(_v))
          : Either.Right(addCreated(video))
    )
    .then(v => v.chain(x => Validate.video(x)))

export const patchVideo = (db: Types.Connection) => (video: Types.Video) =>
  mergePatchVideo(video).then(z => z.chain(_x => saveNode(db)(_x)))

export const saveNode = db => v =>
  R.compose(Dynamodb.putItem(db), asPatchParam)(v)
    .then(x => Either.Right(x))
    .catch(e => Either.Left(e))
