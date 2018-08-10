/**
 ** enforce nfs headers
 **/
import config from '../../config'

const apiHeader = `application/vnd.vevo.${config.get('service.name')}.v1+json`

export const apiVersion = (ctx, next) => (
    ctx.assert(ctx.request.accepts(apiHeader))? ctx.throw(406) : next()
)
