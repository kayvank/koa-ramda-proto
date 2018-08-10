import convict from 'convict'
import pkg from '../package.json'

const conf = convict({
  team: {
    name: {
      doc: 'vevo dev team name',
      format: String,
      default: 'content-services'
    }
  },
  service: {
    name: {
      doc: 'service friendly name',
      format: String,
      default: pkg.name
    },
    version: {
      doc: 'service version',
      format: String,
      default: pkg.version
    },
    logLevel: {
      doc:
        'Logging level, see: https://github.com/winstonjs/winston#logging-levels',
      format: String,
      default: 'info',
      env: 'LOG_LEVEL'
    },
    statsD: {
      host: {
        doc: 'statsD host. same as DataDog',
        format: String,
        default: '0.0.0.0',
        env: 'STATSD_HOST'
      },
      port: {
        doc: 'statsD host. same as DataDog',
        format: Number,
        default: 8125
      },
      tag: {
        doc: 'statsD tag',
        format: String,
        default: 'local',
        env: 'STATSD_TAG'
      }
    },
    build_info: {
      build_version: {
        doc: '',
        format: String,
        default: '1.pipeline-counter-123',
        env: 'BUILD_VERSION'
      },
      gittag: {
        doc: '',
        format: String,
        default: '007',
        env: 'GITTAG'
      }
    }
  },
  cms: {
    url: {
      doc: 'cms url',
      format: 'String',
      default: 'https://cms.vevo.com',
      env: 'CMS_URL'
    }
  },
  table: {
    nodes: {
      name: 'cs-pub-videos',
      query: { limit: 20 }
    },
    edges: {
      name: 'cs-pub-workflow',
      query: { limit: 20 },
      gsi: { name: 'SubscriberPubStateNdx2' }
    }
  },
  debounce: {
    period: { seconds: 90 }
  },
  schema: {
    pub: {
      api: {
        video: {
          doc: 'schema path (relative) for publish api payload schema',
          format: String,
          default: './services/cs-publishing-api/3.0/video.json'
        }
      }
    }
  }
})

conf.validate({
  allowed: 'strict'
})

module.exports = conf
