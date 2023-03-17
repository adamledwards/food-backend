#!/usr/bin/env bash
set -e

CONTAINER_RUNNER="${CONTAINER_RUNNER:-podman}"
if $CONTAINER_RUNNER container exists food-backend-db ; then
    $CONTAINER_RUNNER stop food-backend-db
else 
    echo "Conatiner is not running"
fi

