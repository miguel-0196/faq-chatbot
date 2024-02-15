#!/bin/sh

sudo systemctl restart mongod
pm2 stop app
pm2 start app.js
pm2 logs