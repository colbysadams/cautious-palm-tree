terraform {
  required_version = ">= 0.12, < 0.13"
}

provider "aws" {
  region = "us-east-2"

  # Allow any 2.x version of the AWS provider
  version = "~> 2.0"
}

module "hello_world_app" {
  source = "../../../../modules/services/hello-world-app"

  environment            = var.environment
  instance_type      = "t2.micro"
  min_size           = 1
  max_size           = 1
  enable_autoscaling = false
  docker_container_port = 3000
  docker_image = "docker.io/colbysadams/websocket-test"
}
