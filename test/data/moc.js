import test from 'ava'
import R from 'ramda'

export const mocDb = {
  query: function(q, f) {
    return f(null, { Items: [q] })
  },
  putItem: (q, h) => h(null, q),
  put: (q, h) => h(null, q),
  get: (q, h) => h(null, { Item: q }),
  batchGet: function(q, f) {
    return f(null, {
      Responses: { 'cs-publish-nodes': [{ video: `${JSON.stringify(q)}` }] }
    })
  }
}

export const edges = [
  {
    //0
    isrc: 'USRV81701431.youtube',
    modified: 1517253038319,
    subscriber: 'youtube',
    state: 'ready',
    transitions: [
      { name: 'ready', from: 'init', to: 'ready', ts: 1517253038310 },
      {
        name: 'processing',
        from: 'ready',
        to: 'processing',
        ts: 1517253038311
      },
      { name: 'republish', ts: 1517253038311 },
      { name: 'ready', from: 'republish', to: 'ready', ts: 1517253038341 },
      {
        name: 'processing',
        from: 'ready',
        to: 'processing',
        ts: 1517253338311
      },
      { name: 'delete', ts: 1517263038311 },
      { name: 'ready', from: 'delete', to: 'ready', ts: 1517263038311 },
      { name: 'processing', from: 'ready', to: 'processing', ts: 1517256338311 }
    ]
  },
  {
    //1
    isrc: 'QMGR31601891.youtube',
    modified: 1517253038319,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [
      { name: 'ready', from: 'init', to: 'ready', ts: 1517253038310 },
      { name: 'processing', from: 'ready', to: 'processing', ts: 1517253038310 }
    ]
  },
  {
    //2
    isrc: 'GB1101100210.youtbe',
    modified: 1517253038317,
    subscriber: 'amazon',
    state: 'ready',
    transitions: [
      { name: 'ready', from: 'init', to: 'ready', ts: 1517253038310 },
      {
        name: 'processing',
        from: 'ready',
        to: 'processing',
        ts: 1517253038300
      },
      {
        name: 'completed',
        from: 'processing',
        to: 'completed',
        ts: 1517253038300
      },
      { name: 'republish' }
    ]
  },
  {
    //3
    isrc: 'GB1101000459',
    modified: 1517253038317,
    subscriber: 'youtube',
    state: 'ready',
    transitions: [
      { name: 'ready', from: 'init', to: 'ready', ts: 1517253038310 },
      {
        name: 'processing',
        from: 'ready',
        to: 'processing',
        ts: 1517253038300
      },
      {
        name: 'completed',
        from: 'processing',
        to: 'completed',
        ts: 1517253038300
      },
      { name: 'republish', from: 'completed', to: 'ready', ts: 1517253038319 }
    ]
  },
  {
    isrc: 'DESJ91400892',
    modified: 1517253038317,
    subscriber: 'youtube',
    state: 'processing',
    transitions: [
      { name: 'ready', from: 'init', to: 'ready', ts: 1517253038310 },
      {
        name: 'processing',
        from: 'ready',
        to: 'processing',
        ts: 1517253038300
      },
      { name: 'republish', ts: 1517253038319 }
    ]
  }
]

export const nodes = {
  Responses: {
    'cs-publish-nodes': [
      {
        isrs: 'DESJ91400892',
        video: {
          S:
            '{"asset":"[{"s1": "s1", "n1": 1}, {s2: "s2", n2: 2}, {s3: "s3", n3: 3}]"}'
        }
      },
      {
        isrs: 'GB1101000459',
        video: {
          S:
            '{"asset":"[{"s1": "s1", "n1": 1}, {s2: "s2", n2: 2}, {s3: "s3", n3: 3}]"}'
        }
      },
      {
        isrs: 'GB1101100210',
        video: {
          S:
            '{"asset":"[{"s1": "s1", "n1": 1}, {s2: "s2", n2: 2}, {s3: "s3", n3: 3}]"}'
        }
      },
      {
        isrs: 'QMGR31601891',
        video: {
          S:
            '{"asset":"[{"s1": "s1", "n1": 1}, {s2: "s2", n2: 2}, {s3: "s3", n3: 3}]"}'
        }
      },
      {
        isrs: 'USRV81701431',
        video: {
          S:
            '{"asset":"[{"s1": "s1", "n1": 1}, {s2: "s2", n2: 2}, {s3: "s3", n3: 3}]"}'
        }
      }
    ]
  }
}
test.skip('will not be run', t => {
  t.fail()
})
