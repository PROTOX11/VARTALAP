#!/bin/bash
set -a
source /vercel/share/.env.project
set +a
exec node server/server.js
