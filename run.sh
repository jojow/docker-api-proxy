#!/bin/bash

APP_NAME="docker-api-proxy"

if [ -z "$APP_DIR" ]; then
  APP_DIR="$HOME/$APP_NAME"
fi

NVM_DIR="$APP_DIR/.nvm"



source $NVM_DIR/nvm.sh

cd $APP_DIR

#forever -c "npm start" -l ./forever.log -o ./out.log -e ./err.log .
forever start -c "npm start" -l ./forever.log -o ./out.log -e ./err.log .
