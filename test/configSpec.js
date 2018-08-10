import config from '../src/config'
import test from 'ava'

test('vevo configuration variable should be set', t => {
  t.truthy(config.get('service.name') === 'cs-publish-api')
  t.truthy(config.get('service.statsD.host') === '0.0.0.0')
  t.truthy(config.get('service.statsD.port') === 8125)
  t.truthy(
    config.get('service.build_info.build_version') === '1.pipeline-counter-123'
  )
  t.truthy(config.get('team.name') === 'content-services')
  t.truthy(config.get('cms.url') === 'https://cms.vevo.com')
  t.truthy(config.get('table.edges.name') === 'cs-pub-workflow')
  t.truthy(config.get('table.nodes.name') === 'cs-pub-videos')
})
