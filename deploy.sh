#!/bin/bash

. ./deploy_vars.sh

ssh $SERVER BFBOT_DIR="$BFBOT_DIR" 'bash -s' < deploy_script.sh
