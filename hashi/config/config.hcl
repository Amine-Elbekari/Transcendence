storage "file" {
    path = "/vault/data"
}

listener "tcp" {
    address = "0.0.0.0:8200"
    tls_disable = 1
}

api_addr = "http://hashicorps-vault:8200"

ui = true