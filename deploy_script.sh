#!/bin/bash
. ~/.bashrc # Load NVM
cd $BFBOT_DIR
pwd
nvm use
forever stop "discord-bfbot" # Stop existing bot instances
git pull # Pull newest code
npm install # Install changed dependencies
knex migrate:latest # Run DB migrations
forever -a -l log.log -o out.log -e err.log -u "discord-bfbot" start src/index.js # Start a new bot instance
