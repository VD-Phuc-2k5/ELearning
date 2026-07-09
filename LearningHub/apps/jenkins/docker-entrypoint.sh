#!/bin/bash
set -e

if [ -S /var/run/docker.sock ]; then
  DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo "")
  if [ -n "$DOCKER_GID" ] && [ "$DOCKER_GID" != "0" ]; then
    groupmod --gid "$DOCKER_GID" docker 2>/dev/null || groupadd --gid "$DOCKER_GID" docker-host 2>/dev/null || true
    usermod -aG "$DOCKER_GID" jenkins 2>/dev/null || true
  fi
fi

exec /usr/local/bin/jenkins.sh "$@"
