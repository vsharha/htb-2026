variable "region" {
  description = "Vultr region ID for the instance. London keeps latency to Edinburgh low."
  type        = string
  default     = "lhr"
}

variable "plan" {
  description = "Vultr plan ID. A GPU plan runs the decision model on Vultr Cloud GPU; a CPU plan also works but scores slower. List plans with `curl -s -H \"Authorization: Bearer $VULTR_API_KEY\" 'https://api.vultr.com/v2/plans?type=vcg'`."
  type        = string
  default     = "vhp-12c-24gb-amd"
}

variable "os_name" {
  description = "Exact OS name to install, as listed by the Vultr API."
  type        = string
  default     = "Ubuntu 24.04 LTS x64"
}

variable "model" {
  description = "System One decision model the web app uses by default."
  type        = string
  default     = "clef-flash"
}

variable "extra_models" {
  description = "Further models to pull so the app can switch between them without reprovisioning, for example tev1:4b when CPU inference is too slow for the 9B model."
  type        = list(string)
  default     = ["tev1:4b"]
}

variable "instance_label" {
  description = "Label for the instance in the Vultr console."
  type        = string
  default     = "placewise-decision-model"
}
