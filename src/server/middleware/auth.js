/**
 ** vevo authentication middleware
 **/

const vevoAuth = require('@vevo/node-auth')

export function auth(opts) {
  opts = opts || {}
  return async function(ctx, next) {
    try {
      await vevoAuth.authenticate(ctx)
    } catch (e) {
      ctx.throw(e[0].statusCode, e[0].message, e[0])
    }
    await next()
  }
}
