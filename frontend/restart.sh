#!/bin/sh

pm2 stop faq-chat-frontend
pm2 start "npm start" --name "faq-chat-frontend" --watch --ignore-watch="node_modules" --log-date-format="YYYY-MM-DD HH:mm Z"