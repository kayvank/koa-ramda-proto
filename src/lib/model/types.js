// @flow
type EdgeKeyList = {
  isrc: string,
  subscriber: Array<string>
}
type EdgeKey = {
  isrc: string,
  subscriber: string
}

type Edge = {
  isrc: string,
  modified: number,
  subscriber: string,
  state: string,
  transition: Array<any>
}

type PubStatus = {
  subscriber: string,
  isrc: string,
  status: string
}

type Range = {
  initial: number,
  final: number
}

type Connection = any

type Video = any

type Function = any
