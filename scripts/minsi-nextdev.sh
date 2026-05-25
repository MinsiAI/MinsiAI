#!/bin/zsh
cd /Users/wangzhiguo/Desktop/MinsiAI || exit 1

export HOME=/Users/wangzhiguo
export NODE_ENV=development
export PATH=/Users/wangzhiguo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin

exec /Users/wangzhiguo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  /Users/wangzhiguo/Desktop/MinsiAI/node_modules/next/dist/bin/next \
  dev \
  --hostname 0.0.0.0 \
  --port 3000
