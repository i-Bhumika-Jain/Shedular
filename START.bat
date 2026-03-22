@echo off
echo ==============================================
echo = Starting My Daily Planner App...           =
echo ==============================================
echo.
echo Please keep this window open while using the app!
echo To stop the app, press Ctrl+C or close this window.
echo.

:: Switch to H: drive to avoid UNC path errors
H:
cd H:\Desktop\TT

:: Run the Vite development server
npm run dev
