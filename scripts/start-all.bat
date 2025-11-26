@echo off

:: Start Docker containers for databases (MongoDB & Redis)
docker-compose -f ..\docker-compose.yml up -d mongodb-auth redis-auth mongodb-course redis-course mongodb-payment redis-payment

:: Start Auth Service
cd /d "%~dp0..\packages\backend\auth-service"
start "Auth Service" cmd /k "npm start"

:: Start Payment Service
cd /d "%~dp0..\packages\backend\payment-service"
start "Payment Service" cmd /k "npm start"

:: Start API Gateway
cd /d "%~dp0..\packages\backend\api-gateway"
start "API Gateway" cmd /k "npm start"

:: Start Frontend (Vite dev server)
cd /d "%~dp0..\packages\frontend"
start "Frontend" cmd /k "npm run dev"

:: Optionally start other services (e.g., Course Service, AI Service) if needed
:: cd /d "%~dp0..\packages\backend\course-service"
:: start "Course Service" cmd /k "npm start"

:: End of script
