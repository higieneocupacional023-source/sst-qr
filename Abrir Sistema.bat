@echo off
echo Iniciando Sistema SST...
echo.

:: Inicia o servidor em segundo plano
start /B node server.js

:: Espera 2 segundos para o servidor iniciar
timeout /t 2 /nobreak >nul

:: Abre o navegador
start http://localhost:8080

echo Sistema SST iniciado!
echo Acesse: http://localhost:8080
echo.
echo Para parar o servidor, feche a janela do Node.js ou pressione Ctrl+C
echo.

pause