npm install
npm run build
sudo cp DigitalOcean-db-ca-certificate.crt dist/DigitalOcean-db-ca-certificate.crt
sudo pm2 restart wallet-scan
