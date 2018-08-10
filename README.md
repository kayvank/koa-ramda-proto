![diagram](docs/design/cs-publish.jpg)

cs-publish-api
==============
cs-publish-api provides subscriber-based video publication functionality.

## Detail
cs-publish-api is a kubernetese node application providing asset publication [workflow](docs/design/Edge.jpg).  The API supports the following functionalities:
1. pub-query reports
  * report assets in pub-ready states
  * report status of previously published assets
  * report service layer status
     * when the service was built & version number 
     * service status and health
     * database connection health
2. acquisition
  * acquired 
    * newly publishable videos added to catalog 
    * pub-worthy asset modifications/updates
    * pub asset related data, these are usually specific to the subscribers
    * CMS pub related data to be augmented to asset data


## URL inventory
To support the above functionality the API supports the following routes :

1. routes requiring user-token
```
  get('/status/:subscribe/:isrc') ##  publication status 
  .post('/status/:subscriber/:isrc') 
  .patch('/video/:isrc') ## additional pub related video data
  .post('/') ## reciving new/previously-published video
```
2. Public routes. no user token required
```
  .get('/public/up/') ## provide service status
  .get('/public/ready') ## service is up, used by k8
  .get('/public/buildInfo') ## build specific relate info
```
 routes are enumerated in [routes.js](./src/server/routes.js)

## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
1. [install npm](https://www.npmjs.com/get-npm)
2. install gulp-cli
```
npm install --global gulp-cli
```
3. set up environment variables
```
export LOG_LEVEL='info'
export STRINGER_VERSION=latest
export NODE_VERSION='9.0-wheezy'
## 
## docker stuff for pushing the image to docker-hub
##
export DOCKER_USER='######'
export DOCKER_PASS='#####'
##
## gocd env vars to simulate deploy
##
export GO_PIPELINE_COUNTER=321
export CLUSTER=services
export STRINGER_VERSION='1.3.283'
export DOCKER_NODE_IMAGE=node
export GO_PIPELINE_COUNTER='pipeline-counter-123'
export GO_REVISION='007'
export GITTAG=$GO_REVISION
PACKAGE_VERSION=1
export BUILD_VERSION=$PACKAGE_VERSION.$GO_PIPELINE_COUNTER
```

### Installing

```
cd cs-publish-api
npm  install
gulp
npm test
npm test -- --watch  ## for coninues test
## to run 
gulp && npm run start
```

## References

[gulp](https://gulpjs.com/)

[flow](https://flow.org/en/docs/types/)

[kcl](http://docs.aws.amazon.com/streams/latest/dev/kinesis-record-processor-implementation-app-nodejs.html)

[ramdajs](http://ramdajs.com/)

[dynamo-javascript-sdk](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html)

[Professor Frisby's Mostly Adequate Guide to Functional Programming](https://github.com/MostlyAdequate/mostly-adequate-guide)

[fanasy-land](https://github.com/fantasyland/fantasy-land)

[Folktale](https://github.com/folktale)



