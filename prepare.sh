#!/bin/bash
set -e

sys_has() {
  type "$1" > /dev/null 2>&1
  return $?
}



if sys_has "apt-get"; then
  export DEBIAN_FRONTEND="noninteractive"
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
