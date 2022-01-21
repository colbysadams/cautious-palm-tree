
# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS
# These parameters have reasonable defaults.
# ---------------------------------------------------------------------------------------------------------------------

variable "environment" {
  description = "The name of the environment we're deploying to"
  type        = string
  default     = "stage"
}
