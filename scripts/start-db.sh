#!/usr/bin/env bash
set -e

CONTAINER_RUNNER="${CONTAINER_RUNNER:-podman}"
if $CONTAINER_RUNNER container exists food-backend-db ; then
    RUNNING="$(podman inspect food-backend-db  --format "{{.State.Running}}")"
    if $RUNNING = 'true' ; then
        echo DB container is already running
    else
        $CONTAINER_RUNNER start food-backend-db
    fi
else 
    $CONTAINER_RUNNER run -p 5432:5432 -d -v /var/lib/postgresql/data --name=food-backend-db -e POSTGRES_PASSWORD=secret postgres 
fi

