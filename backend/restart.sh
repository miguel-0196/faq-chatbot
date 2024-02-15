#!/bin/sh

pm2 stop app
pm2 start app.js

pm2 list
pm2 logs