#!/bin/sh
set -e

if [ -S /var/run/docker.sock ]; then
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
    if [ "$DOCKER_GID" != "0" ]; then
        GROUP_NAME=$(getent group "$DOCKER_GID" | cut -d: -f1)
        if [ -z "$GROUP_NAME" ]; then
            GROUP_NAME="docker-host"
            addgroup -g "$DOCKER_GID" "$GROUP_NAME" 2>/dev/null || true
        fi
        addgroup nestjs "$GROUP_NAME" 2>/dev/null || true
    fi
fi

exec su-exec nestjs "$@"
