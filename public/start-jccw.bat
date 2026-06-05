@echo off
:: Abre PowerShell como administrador executando os comandos necessários
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoExit','-Command','cd C:\Users\Adm\.gemini\antigravity\scratch\jc-card-wars; npm run dev'"
