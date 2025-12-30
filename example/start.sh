#!/bin/bash

# Increase file descriptor limit
ulimit -n 4096

# Start Expo with dev client
npm start

