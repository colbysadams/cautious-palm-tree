DOCKER_USERNAME   ?= colbysadams
REGISTRY_NAME     ?= docker.io/$(DOCKER_USERNAME)/websocket-test

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
	docker build -t $(REGISTRY_NAME):latest .

.PHONY: push
push: ## build and push the docker container
	${MAKE} build
	docker push $(REGISTRY_NAME):latest

.PHONY: run-docker
run-docker: ## run the latest docker image
	${MAKE} build
	docker run -it --rm -p 8080:3000 $(REGISTRY_NAME):latest

.PHONY: deploy
deploy: ## re-build app and deploy to aws via terraform
	${MAKE} push
	${MAKE} apply

.PHONY: apply
apply:
	 cd terraform/live/stage/services/hello-world-app && terraform apply