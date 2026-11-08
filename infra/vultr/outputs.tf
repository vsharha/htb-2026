// Caddy gets a real certificate because <ip>.sslip.io resolves to the instance.
output "url" {
  description = "Base URL for the System One endpoint; append /v1/systemone."
  value       = "https://${vultr_instance.model.main_ip}.sslip.io"
}

output "token" {
  description = "Bearer token the endpoint requires."
  value       = random_password.systemone.result
  sensitive   = true
}

output "model" {
  value = var.model
}

output "instance_ip" {
  value = vultr_instance.model.main_ip
}
