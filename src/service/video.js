// @flow

import * as node from '../lib/repo/nodes.js'
import * as WFR from '../lib/repo/wfRouter.js'
import * as WF from '../lib/repo/wf.js'
import * as ED from '../lib/repo/edgesDynamo'
import conf from '../config'
import model from '../lib/model'
import * as Types from '../lib/model/types'
import Repo from '../lib/repo'
import R from 'ramda'
import Utils from '../lib/utils'
import * as Validate from '../lib/validation/v'
import Either from 'data.either'

const debounceTimeLimit = conf.get('debounce.period.seconds') * 1000
const temporalFrom = () => Date.now() - debounceTimeLimit

export const patchVideo = isrc => video =>
  Promise.resolve(R.identity({ isrc: isrc, video: video }))

export const existingEdge = (_edge: any) => (video: any) =>
  edge.isRepublish(_edge)
    ? R.identity('republish-edge')
    : R.identity('update-timestamp')

export const saveVideo = isrc => video => node.saveNode(Repo.db())(video)

export const ready = debounceTime => limit => subscriber =>
  edge
    .readyEdges(Repo.db())(debounceTime, limit, subscriber)
    .then(x =>
      Repo.nodes(Repo.db())(R.concat(x['publish'], x['republish']))
        .then(n =>
          Utils.partition(Utils.hasSublist)(n)(x['republish'], x['publish'])
        )
        .then(n => {
          return { republish: n[0], publish: n[1] }
        })
    )

export const readyWithDebounce = limit => subscriber =>
  ready(temporalFrom())(limit)(subscriber)

export const readyToPublish = ctx =>
  readyWithDebounce(ctx.request.query['limit'] || 10)(ctx.params['subscriber'])

export const isValidStatus = status =>
  typeof model.publication.state[status] === 'string'

export const statusReport = ctx => {
  return 'statusReport is under construction!'
}
export const statusRouter = ctx =>
  Repo.statusRouter(Repo.db())({
    isrc: ctx.params['isrc'],
    subscriber: ctx.params['subscriber'],
    status: ctx.request.body['status']
  })

export const patchRouter = (isrc: string) => (video: any) =>
  Validate.isrc(isrc)
    ? node.patchVideo(Repo.db())(R.merge({ isrc: isrc }, video))
    : // .then(n => n.chain(WF.wfRouter(Repo.db())(isrc)))
      Promise.resolve(Either.Left(VE.validationException(`${isrc} is invalid`)))

export const videoByIsrc = (isrc: string) =>
  Validate.isrc(isrc).chain(v => node.node(Repo.db())(v))
