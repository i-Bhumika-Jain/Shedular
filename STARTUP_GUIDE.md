# Application Startup Guide

Here are the complete instructions to start your "My Daily Planner" application!

## Method 1 (Easiest): Double Click the BAT file
I have placed a file named `START.bat` directly on your Desktop project folder!
Whenever you want to start the app, **simply double-click `START.bat`**. This file will automatically open a terminal and start the server for you.
Please **keep the black terminal window open** while you use the application. If you close it, the website will go offline.

## Method 2: Use the Terminal (Manual Way)
If you prefer to start the application yourself by typing the code in the terminal, here are the exact commands you need to type.

1. Open your terminal or Command Prompt.
2. In the terminal, navigate to your mapped `H:` drive instead of using the network path (because Windows network paths break the code). Type:
   ```cmd
   H:
   cd H:\Desktop\TT
   ```
3. Type the start command and press Enter:
   ```cmd
   npm run dev
   ```

4. You will see a success message that gives you a local URL (like `http://localhost:3000` or `http://localhost:3001`). Hold `Ctrl` on your keyboard and click the link to open it in your browser!

## Having problems?
If your browser says "Unable to connect" or "Site can't be reached", return to the black terminal window and look for errors. The application must be running in the terminal for the website to load!
