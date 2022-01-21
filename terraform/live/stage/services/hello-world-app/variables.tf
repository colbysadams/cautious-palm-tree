
# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS
# These parameters have reasonable defaults.
# ---------------------------------------------------------------------------------------------------------------------

variable "environment" {
  description = "The name of the environment we're deploying to"
  type        = string
  default     = "stage"
}

variable "docker_image_tag" {
  description = "tag of image to run"
}

variable "docker_image" {
  description = "docker image to run"
}
