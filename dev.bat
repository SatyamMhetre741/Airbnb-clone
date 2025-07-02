@echo off
echo Starting development server with nodemon...
npx nodemon --config nodemon.json

if %ERRORLEVEL% NEQ 0 (
    echo Nodemon failed, trying to run with node directly...
    node app.js
)
