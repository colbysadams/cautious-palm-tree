DOCKER_USERNAME   ?= colbysadams
REGISTRY_NAME     ?= docker.io/$(DOCKER_USERNAME)/websocket-test
DOCKER_TAG        ?= 0.0.1
# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## This help.
	@awk 'BEGIN {FS = "(-default|:.*?## )"} /^[a-zA-Z_-]+:.*?## / { \
if ($$2 == "")\
	printf "\033[36m%-20s\033[0m (default) %s \n", $$1, $$3; \
else \
	printf "\033[36m%-30s\033[0m %s \n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: ## install dependencies for project
	npm install

.PHONY: build
build: ## build the docker container
	@echo "--- make build"
	docker build -t $(REGISTRY_NAME):$(DOCKER_TAG) -t $(REGISTRY_NAME):latest .

.PHONY: push
push: ## build and push the docker container
	${MAKE} build
	docker push --all-tags $(REGISTRY_NAME)

.PHONY: run-docker
run-docker: ## run the latest docker image
	${MAKE} build
	docker run -it --rm -p 8080:3000 $(REGISTRY_NAME):$(DOCKER_TAG)

.PHONY: deploy
deploy: ## re-build app and deploy to aws via terraform
	${MAKE} push
	${MAKE} apply

.PHONY: apply
apply: export TF_VAR_docker_image_tag=$(DOCKER_TAG)
apply: export TF_VAR_docker_image=$(REGISTRY_NAME)
apply:
	 cd terraform/live/stage/services/hello-world-app && terraform apply