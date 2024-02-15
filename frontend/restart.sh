#!/bin/sh

pm2 stop react-app
pm2 start "npm start" --name "react-app" --watch --ignore-watch="node_modules" --log-date-format="YYYY-MM-DD HH:mm Z"

pm2 list
pm2 logs