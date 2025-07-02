# Start the development server with nodemon
Write-Host "Starting development server with nodemon..."
npx nodemon --config nodemon.json

# If nodemon fails to start or has issues, this will run
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nodemon failed, trying to run with node directly..."
    node app.js
}
