FISHMARKET CONNECT - RUNNING GUIDE
=================================

PROJECT STRUCTURE
- index.html and style.css are the frontend.
- script.js/script.js is the frontend JavaScript file.
- script.js/server.js is the Node.js backend for the AI chatbot.
- script.js/icons contains the navigation icons.

1) RUN THE WEBSITE
- Open the "palmero group" folder in VS Code.
- Install the Live Server extension if needed.
- Right-click index.html and choose "Open with Live Server".
- The website should open at http://127.0.0.1:5500/index.html.

2) RUN THE BACKEND (OPTIONAL; NEEDED FOR AI CHATBOT)
- Install Node.js LTS if it is not installed.
- Open a VS Code terminal in the project folder.
- Run:
    cd script.js
    npm install
    npm start
- Backend health check: http://localhost:3000/
- Keep this terminal open while using the chatbot.

3) ENABLE THE AI CHATBOT
- Open script.js/.env.
- Replace your_api_key_here with your own valid OpenAI API key.
- Save the file and restart the backend (Ctrl+C, then npm start).
- Do not share or commit your API key. The website can run without it, but AI replies will remain unavailable.

TROUBLESHOOTING
- If port 5500 is busy, Live Server may use 5501. The backend CORS config permits localhost/127.0.0.1 on local ports.
- If npm is not recognized, install Node.js LTS and restart VS Code.
- If the chatbot says it cannot connect, confirm the backend terminal is running at port 3000.
- If the chatbot reports an API/model error, check that your API key is valid and that the model in .env is available to your API account.


CHATBOT OFFLINE FALLBACK:
The backend now automatically replies using local system data if the OpenAI API key
is missing or the API request fails (including no credits / 429 errors).
Local fallback can answer basic questions about listed fish prices, markets,
buyer availability, recent catch reports, and system features. It does not use
internet/live data and does not generate free-form AI answers.

After updating files, restart the backend:
1. In the backend terminal, press Ctrl+C.
2. Run: npm start
3. Keep the backend terminal open.
4. Open index.html with Live Server.
