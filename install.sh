#!/bin/bash

#
# Install:
#  curl -L https://raw.github.com/jojow/docker-api-proxy/master/install.sh | bash
#  wget -qO- https://raw.github.com/jojow/docker-api-proxy/master/install.sh | bash
#

set -e

APP_NAME="docker-api-proxy"

sys_has() {
  type "$1" > /dev/null 2>&1
  return $?
}

if [ -z "$APP_DIR" ]; then
    APP_DIR="$HOME/$APP_NAME"
fi

NVM_DIR="$APP_DIR/.nvm"

NVM_VERSION="0.26.0"
NODE_VERSION="0.10"



if sys_has "apt-get"; then
  sudo apt-get -y update
  sudo apt-get -y install curl git python-software-properties python g++ make
elif sys_has "yum"; then
    sudo yum -y install curl git-core
fi

if ! sys_has "curl"; then
  echo "FAIL: curl is not installed"
  exit 1
fi

if ! sys_has "git"; then
  echo "FAIL: git is not installed"
  exit 1
fi

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

npm install -g forever

cd $APP_DIR

npm install

chmod a+x run.sh

echo "INFO: run application by invoking $APP_DIR/run.sh"

#
# Run:
#  $APP_DIR/run.sh
#
