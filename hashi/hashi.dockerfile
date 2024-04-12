FROM vault:1.13.3

COPY ./config/config.hcl /vault/config/

EXPOSE 8200

ENV VAULT_ADDR=http://127.0.0.1:8200

ENTRYPOINT [ "vault", "server", "-config=/vault/config/config.hcl" ]

# CMD [ "tail", "-f"]