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

resource "vultr_firewall_group" "model" {
  description = var.instance_label
}

resource "vultr_firewall_rule" "ssh" {
  firewall_group_id = vultr_firewall_group.model.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = split("/", var.ssh_cidr)[0]
  subnet_size       = tonumber(split("/", var.ssh_cidr)[1])
  port              = "22"
  notes             = "ssh"
}

resource "vultr_firewall_rule" "http" {
  firewall_group_id = vultr_firewall_group.model.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "80"
  notes             = "acme"
}

resource "vultr_firewall_rule" "https" {
  firewall_group_id = vultr_firewall_group.model.id
  protocol          = "tcp"
  ip_type           = "v4"
  subnet            = "0.0.0.0"
  subnet_size       = 0
  port              = "443"
  notes             = "systemone"
}

resource "vultr_instance" "model" {
  label             = var.instance_label
  region            = var.region
  plan              = var.plan
  os_id             = data.vultr_os.ubuntu.id
  hostname          = var.instance_label
  firewall_group_id = vultr_firewall_group.model.id
  enable_ipv6       = false
  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    model = var.model
    token = random_password.systemone.result
    email = var.acme_email
  })
}
