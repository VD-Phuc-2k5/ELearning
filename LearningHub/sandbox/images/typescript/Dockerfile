FROM denoland/deno:alpine
# Deno alpine runs as root by default, let's add sandbox user
RUN adduser -D -s /bin/sh sandbox
USER sandbox
WORKDIR /sandbox
