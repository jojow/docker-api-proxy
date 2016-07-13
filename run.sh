#!/bin/bash
set -e

APP_NAME="docker-api-proxy"

if [ -z "$APP_DIR" ]; then
  APP_DIR="$HOME/$APP_NAME"
fi

NVM_DIR="$APP_DIR/.nvm"



source $NVM_DIR/nvm.sh

cd $APP_DIR

npm run start-forever
