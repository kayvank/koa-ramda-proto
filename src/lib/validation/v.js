//@flow

import R from 'ramda'
import Either from 'data.either'
import * as T from '../model/types'
const V = require('@vevo/cs-validator').create().publicationvideo
const VE = require('@vevo/node-errors')

export const isrc = (id: string) =>
  V.validateIdentifier(id)
    ? Either.Right(id)
    : Either.Left(VE.validationException(`invalid isrc: ${id}`))

export const video = (v: T.Video) =>
  V.validate(v)
    .then(i => Either.Right(v))
    .catch(e => Either.Left(VE.validationException(e)))
