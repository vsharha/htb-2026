terraform {
  required_version = ">= 1.6"

  required_providers {
    vultr = {
      source  = "registry.terraform.io/vultr/vultr"
      version = "~> 2.0"
    }
    random = {
      source  = "registry.terraform.io/hashicorp/random"
      version = "~> 3.6"
    }
  }
}

// The API key comes from VULTR_API_KEY, so no credential is committed.
provider "vultr" {}
