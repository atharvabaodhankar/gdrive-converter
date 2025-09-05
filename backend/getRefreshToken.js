// getRefreshToken.js
// -------------------
// Steps:
// 1. Go to Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID
//    Set redirect URI = http://localhost:5173/oauth2callback
// 2. Fill your .env with GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REDIRECT_URI
// 3. Run: node getRefreshToken.js
// 4. Browser opens → sign in → grant access
// 5. Terminal prints your refresh token → copy into .env

require("dotenv").config();
const http = require("http");
const open = require("open");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI; // e.g. http://localhost:5173/oauth2callback

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error("❌ Missing CLIENT_ID / CLIENT_SECRET / REDIRECT_URI in .env");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",      // ensures refresh token is returned
  prompt: "consent",           // forces consent screen → always gives refresh token
  include_granted_scopes: true,
  scope: ["https://www.googleapis.com/auth/drive.file"], // only file access
});

console.log("\n➡️  If browser doesn’t open automatically, open this URL:\n", authUrl);

// Local server to handle Google redirect
const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith("/oauth2callback")) {
    res.writeHead(404);
    return res.end("Not found");
  }

  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400);
    return res.end("Missing authorization code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("\n✅ Your Refresh Token is:\n");
    console.log(tokens.refresh_token);
    console.log("\n👉 Copy this into your .env as GOOGLE_DRIVE_REFRESH_TOKEN");

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Authentication successful. Check your terminal for the refresh token.");
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err.response?.data || err);
    res.writeHead(500);
    res.end("Token exchange failed. See terminal.");
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(5173, async () => {
  console.log("\n🚀 Listening on http://localhost:5173 ...");
  try {
    await open(authUrl);
  } catch {
    console.log("⚠️ Could not auto-open browser. Please open the URL manually.");
  }
});
