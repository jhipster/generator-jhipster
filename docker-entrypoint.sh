#!/bin/bash

# inspired by https://github.com/docker-library/mysql/blob/bb7ea52db4e12d3fb526450d22382d5cd8cd41ca/5.7/docker-entrypoint.sh

if [ "$(id -u)" = '0' ]; then
  JHIPSTER_GID=1000
  JHIPSTER_UID=1000
  if [ -d /home/jhipster/app ]; then
    JHIPSTER_GID=$(stat -c '%g' /home/jhipster/app)
    JHIPSTER_UID=$(stat -c '%u' /home/jhipster/app)
  fi
  if [ -d /home/jhipster ]; then
    chown $JHIPSTER_UID:$JHIPSTER_GID /home/jhipster
  fi
  groupadd --gid $JHIPSTER_GID jhipster
  useradd --uid $JHIPSTER_UID jhipster -s /bin/bash -m -g jhipster -G sudo 2>/dev/null
  echo 'jhipster:jhipster' |chpasswd
	exec sudo -i -u jhipster "$BASH_SOURCE" "$@"
else
  if [ "$(id -nu 2>/dev/null)" != "jhipster" ]; then
    mkdir /tmp/jhipster-home
    export HOME=/tmp/jhipster-home
  fi
  mkdir -p "$HOME/app"
fi

export SDKMAN_DIR="/usr/local/sdkman"
source $SDKMAN_DIR/bin/sdkman-init.sh

cd "$HOME/app"
yarn config set prefix "$HOME/.yarn-global" >/dev/null
export PATH="$PATH:/usr/bin:$HOME/.yarn-global/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin"

exec "$@"
