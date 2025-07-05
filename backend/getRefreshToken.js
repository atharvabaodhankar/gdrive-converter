const { google } = require('googleapis');
const readline = require('readline');

// Instructions:
// 1. Fill in your CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI from the Google Cloud Console.
const CLIENT_ID = '679248887138-kalr7ihuu1vos5usgaj39dfafbaevipe.apps.googleusercontent.com'
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173/oauth2callback';

// 2. Run `node getRefreshToken.js` in your terminal.
// 3. Open the generated URL in your browser.
// 4. Authorize the application.
// 5. You will be redirected to a "This site can’t be reached" page. This is normal.
// 6. Copy the *entire* URL from your browser's address bar.
// 7. Paste the URL back into the terminal and press Enter.
// 8. The script will print your Refresh Token. Copy it into your .env file.

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the URL you were redirected to: ', async (url) => {
  const code = new URL(url).searchParams.get('code');
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log('\nYour Refresh Token is:');
  console.log(tokens.refresh_token);
  console.log('\nCopy this into your .env file as GOOGLE_DRIVE_REFRESH_TOKEN');
});
