VERSION=1.0
APP_NAME=cs-publish-api
IMAGE=vevo/$(APP_NAME)
GITTAG=$(GO_REVISION)
TAG=$(VERSION).$(GITTAG)
TEAM=content-services
BUILD_VERSION=$(VERSION).$(GO_PIPELINE_COUNTER)
DC=docker-compose
DC_C=$(DC)  -f docker-compose-deploy.yml 

#  local deploys
# DC_C=$(DC) -f docker-compose-deploy-local.yml 
#
SETUP_CREDENTIALS=$(DC_C) run --rm config

# AWS_CONFIG will generates the aws_config in a volume later used by stringer
AWS_CONFIG=$(DC_C) run --rm config
DEV_AWS_CONFIG=AWS_ACCESS_KEY_ID=$(DEV_AWS_ACCESS_KEY_ID) AWS_SECRET_ACCESS_KEY=$(DEV_AWS_SECRET_ACCESS_KEY) $(AWS_CONFIG)
STG_AWS_CONFIG=AWS_ACCESS_KEY_ID=$(STG_AWS_ACCESS_KEY_ID) AWS_SECRET_ACCESS_KEY=$(STG_AWS_SECRET_ACCESS_KEY) $(AWS_CONFIG)
PRD_AWS_CONFIG=AWS_ACCESS_KEY_ID=$(PRD_AWS_ACCESS_KEY_ID) AWS_SECRET_ACCESS_KEY=$(PRD_AWS_SECRET_ACCESS_KEY) $(AWS_CONFIG)

# stringer
STRINGER=$(DC_C) run --rm stringer
DEV_STRINGER=AWS_ACCOUNT=dev $(STRINGER)
STG_STRINGER=AWS_ACCOUNT=stg $(STRINGER)
PRD_STRINGER=AWS_ACCOUNT=prd $(STRINGER)

SLACK_NOTIFY=$(DC) -f resources/docker-compose.slack.yml run --rm
NODE=$(DC_C) run --rm node
GULP=node_modules/.bin/gulp

login:
	@if [ ! -f ".npmrc" ]; then printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" > .npmrc ; fi
	@docker login -u "$(DOCKER_USER)" -p "$(DOCKER_PASS)"

clean: 
	$(NODE) $(GULP) clean

install: login
	$(NODE) npm install 

dist: install 
	$(NODE) $(GULP) 

build_image:  dist
	docker build -t $(IMAGE):$(VERSION) \
	--build-arg npm_token=$(NPM_TOKEN) \
	--squash .

tag_image: build_image
	docker tag $(IMAGE):$(VERSION)  $(IMAGE):$(TAG)
	docker tag $(IMAGE):$(VERSION) $(IMAGE):latest

publish_image: tag_image
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):latest

build: publish_image

terraform_plan:
	$(SETUP_CREDENTIALS)
	$(STRINGER) build --tags=terraform
	$(STRINGER) terraform plan

terraform_apply: terraform_plan
	$(SETUP_CREDENTIALS)
	$(STRINGER) build --tags=terraform
	$(STRINGER) terraform apply

dev:  terraform_apply
	$(DEV_AWS_CONFIG)
	$(DEV_STRINGER) build --tags=kubernetes \
		--extra-vars="docker_image=$(IMAGE):$(TAG)" \
		--extra-vars="build_version=$(BUILD_VERSION)" \
		--extra-vars="gittag=$(GITTAG)"
	$(DEV_STRINGER) kubectl apply -R -f /build/kubernetes
	$(DEV_STRINGER) kubectl rollout status deployment/$(APP_NAME) \
		--namespace content-services

stg: terraform_apply
	$(STG_AWS_CONFIG)
	$(STG_STRINGER) build --tags=kubernetes \
		--extra-vars="docker_image=$(IMAGE):$(TAG)" \
		--extra-vars="build_version=$(BUILD_VERSION)" \
		--extra-vars="gittag=$(GITTAG)"
	$(STG_STRINGER) kubectl apply -R -f /build/kubernetes
	$(STG_STRINGER) kubectl rollout status deployment/$(APP_NAME) \
		--namespace content-services

prd: terraform_plan 
	$(PRD_AWS_CONFIG)
	$(PRD_STRINGER) build --tags=kubernetes \
		--extra-vars="docker_image=$(IMAGE):$(TAG)" \
		--extra-vars="docker_image=$(IMAGE):$(TAG)" \
		--extra-vars="build_version=$(BUILD_VERSION)" \
		--extra-vars="gittag=$(GITTAG)"
	$(PRD_STRINGER) kubectl apply -R -f /build/kubernetes
	$(PRD_STRINGER) kubectl rollout status deployment/$(APP_NAME) \
		--namespace content-services

slack_success:
	$(SLACK_NOTIFY) success

slack_failure:
	$(SLACK_NOTIFY) failure

