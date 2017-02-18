#!/bin/bash
. ~/.bashrc # Load NVM
cd $BFBOT_DIR
git pull # Pull newest code
yarn # Install changed dependencies
knex migrate:latest # Run DB migrations
pm2 restart BfBot
