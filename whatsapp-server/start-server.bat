@echo off
title StarX WhatsApp Backend Server
cd c:\Users\busin\Documents\starx-flow\whatsapp-server

echo Starting Node.js Server on Port 10000...
start /b cmd /c "npm start"

echo Starting Localtunnel Secure Tunnel...
start /b cmd /c "npx -y localtunnel --port 10000 --subdomain starx-flow-backend-tara"

exit
