// @flow

import config from '../../config'
import utils from '../utils'
import AWS from 'aws-sdk'
import R from 'ramda'

type Connection = () => {}

export const _dynamodb: Connection = (() => {
  let _instance
  return {
    INSTANCE: () => {
      if (!_instance) _instance = new AWS.DynamoDB()
      return _instance
    }
  }
})()

export const dynamodb: Connection = (() => {
  let _instance
  return {
    INSTANCE: () => {
      if (!_instance) _instance = new AWS.DynamoDB.DocumentClient()
      return _instance
    }
  }
})()

export const close = db => R.identity(db) //TODO need to close resource
