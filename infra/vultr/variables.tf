variable "region" {
  description = "Vultr region ID for the instance. London keeps latency to Edinburgh low."
  type        = string
  default     = "lhr"
}

variable "plan" {
  description = "Vultr plan ID. A GPU plan runs the decision model on Vultr Cloud GPU; a CPU plan also works but scores slower. List plans with `curl -s -H \"Authorization: Bearer $VULTR_API_KEY\" 'https://api.vultr.com/v2/plans?type=vcg'`."
  type        = string
  default     = "vcg-a16-1c-6gb"
}

variable "os_name" {
  description = "Exact OS name to install, as listed by the Vultr API."
  type        = string
  default     = "Ubuntu 24.04 LTS x64"
}

variable "model" {
  description = "System One decision model to pull with Ollama, for example clef-flash or tev1:4b."
  type        = string
  default     = "clef-flash"
}

variable "instance_label" {
  description = "Label for the instance in the Vultr console."
  type        = string
  default     = "placewise-decision-model"
}

variable "ssh_cidr" {
  description = "IPv4 CIDR allowed to reach SSH. Narrow it to your own address when you can."
  type        = string
  default     = "0.0.0.0/0"
}

variable "acme_email" {
  description = "Contact address for the Let's Encrypt certificate Caddy requests. It is never validated."
  type        = string
  default     = "admin@example.com"
}
