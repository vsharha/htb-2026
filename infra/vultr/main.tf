data "vultr_os" "ubuntu" {
  filter {
    name   = "name"
    values = [var.os_name]
  }
}

// Bearer token Caddy requires before it forwards a request to Ollama, which
// has no authentication of its own.
resource "random_password" "systemone" {
  length  = 48
  special = false
}

resource "vultr_instance" "model" {
  label       = var.instance_label
  region      = var.region
  plan        = var.plan
  os_id       = data.vultr_os.ubuntu.id
  hostname    = var.instance_label
  enable_ipv6 = false
  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    models = concat([var.model], var.extra_models)
    token  = random_password.systemone.result
  })
}
