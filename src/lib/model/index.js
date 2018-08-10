// @flow

const publication = {
  state: {
    ready: 'init',
    ready: 'ready',
    processing: 'processing',
    completed: 'completed',
    error: 'error',
    delete: 'delete',
    republish: 'republish'
  }
}
const subscribers = {
  youtube: 'Youtube',
  amazon: 'Amazon',
  vevo: 'Vevo',
  unknown: 'not-yet-known'
}

const fsmPublish = {
  state: 'ready',
  subscriber: 'youtube',
  isrc: 'zz123-isrc',
  modified: 12345321,
  transitions: [
    { name: 'ready', from: 'init', to: 'ready', ts: 12344 },
    { name: 'processing', from: 'ready', to: 'processing', ts: 12355 },
    { name: 'republish', ts: 12366 },
    { name: 'completed', from: 'processing', to: 'completed', ts: 12377 },
    { name: 'republish', ts: 123 },
    { name: 'delete', ts: 123 }
  ]
}

module.exports = {
  publication: publication,
  subscribers: subscribers
}
