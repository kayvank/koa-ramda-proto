import * as DB from './db'
import * as Node from './nodes'
import * as WFR from './wfRouter'

module.exports = {
  db: DB.dynamodb.INSTANCE,
  dbBatch: DB._dynamodb.INSTANCE,
  saveNode: Node.saveNode,
  nodes: Node.nodes,
  statusRouter: WFR.statusRouter,
  wfRouter: WFR.wfRouter
}
