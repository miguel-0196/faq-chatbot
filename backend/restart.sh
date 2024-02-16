#!/bin/sh


# sudo systemctl restart mongod

pm2 stop faq-chat-backend
pm2 start app.js --name "faq-chat-backend" --watch --ignore-watch="node_modules, uploads" --log-date-format="YYYY-MM-DD HH:mm Z"

pm2 list
pm2 logs