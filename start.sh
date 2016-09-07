#!/bin/bash
nvm use
forever -a -l log.log -o out.log -e err.log -u "discord-bfbot" src/index.js
