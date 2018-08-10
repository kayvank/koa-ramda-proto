/**
 ** middleware
 **/

import * as a from './auth.js'
import * as m from './monitor.js'

module.exports = {
  auth: a.auth,
  report: m.report,
    responseTime: m.responseTime
}
