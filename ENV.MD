# Mongodb

https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

sudo apt-get install gnupg curl

curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
echo "mongodb-org hold" | sudo dpkg --set-selections
echo "mongodb-org-database hold" | sudo dpkg --set-selections
echo "mongodb-org-server hold" | sudo dpkg --set-selections
echo "mongodb-mongosh hold" | sudo dpkg --set-selections
echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
echo "mongodb-org-tools hold" | sudo dpkg --set-selections

sudo systemctl start mongod
sudo systemctl status mongod
ps -ef | grep mongod


# Node.js

sudo apt update
sudo apt install nodejs npm
node -v

npm install pm2 -g
pm2 --v



# Firewall

sudo iptables -L
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo service iptables save
sudo service netfilter-persistent save
sudo service iptables-persistent save
sudo iptables-save > /etc/iptables/rules.v4


# Dependecies

cd backend
npm install
cd ..

cd frontend
npm install



# Run

cd backend
pm2 stop app
pm2 start app.js
cd ..

cd frontend
pm2 stop react-app
pm2 start "npm start" --name "react-app" --watch --ignore-watch="node_modules" --log-date-format="YYYY-MM-DD HH:mm Z"

pm2 logs
pm2 list