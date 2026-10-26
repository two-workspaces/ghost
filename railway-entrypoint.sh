#!/bin/bash
set -e
# MySQL opens its port only once its first-boot init is done; Ghost would
# crash-loop until then.
node /usr/local/lib/railway/railway-setup.cjs wait
# Creates the owner account once Ghost answers, then exits; does nothing on
# later boots.
node /usr/local/lib/railway/railway-setup.cjs setup &
exec docker-entrypoint.sh "$@"
