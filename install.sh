#!/bin/bash
set -e

#
# Install:
#  curl -L https://raw.github.com/jojow/docker-api-proxy/master/install.sh | bash
#  wget -qO- https://raw.github.com/jojow/docker-api-proxy/master/install.sh | bash
#

APP_NAME="docker-api-proxy"

if [ -z "$APP_DIR" ]; then
    APP_DIR="$HOME/$APP_NAME"
fi

NVM_DIR="$APP_DIR/.nvm"

NVM_VERSION="0.31.2"
NODE_VERSION="4"



rm -rf $APP_DIR
git clone https://github.com/jojow/$APP_NAME.git $APP_DIR

rm -rf $NVM_DIR
git clone https://github.com/creationix/nvm.git $NVM_DIR
cd $NVM_DIR
git checkout tags/v$NVM_VERSION

source $NVM_DIR/nvm.sh

nvm install $NODE_VERSION
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION

cd $APP_DIR

npm install

chmod a+x run.sh

echo "INFO: run application by invoking $APP_DIR/run.sh"

#
# Run:
#  $APP_DIR/run.sh
#
