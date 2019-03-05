#!/bin/bash
set -e

# Build, push and deploy our code.
yarn build
git push
scp -r build/* blog:~/www/caddy/music/
