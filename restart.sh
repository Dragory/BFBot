#!/bin/bash
nvm use
forever stop "discord-bfbot" # Stop existing bot instances
forever -a -l log.log -o out.log -e err.log -u "discord-bfbot" start src/index.js # Start a new bot instance
