# ATLAS OAUTH & INTEGRATION GUIDE
## Step-by-Step Google Cloud Configuration, Local OAuth Endpoints & Workspace Setup

**Author:** Antigravity Engineering  
**Version:** 2.0  
**Domain Policy:** Pure Local Development (`http://localhost:8080`) — No Third-Party External Domain Dependencies

---

### 1. Architectural Changes: Complete Domain Isolation

In previous versions, ATLAS included legacy references to `https://atlas.oqens.me`. This domain belongs to an external third party and is not owned by this project.

**All references to `atlas.oqens.me` have been removed from the codebase.**

The backend now computes all callback URLs dynamically using `APP_BASE` (default: `http://localhost:8080`).

#### Registered Local Callback URIs:
- **Unified Google Workspace:** `http://localhost:8080/api/oauth/google/callback`
- **Standalone Gmail:** `http://localhost:8080/api/oauth/gmail/callback`
- **Standalone Google Calendar:** `http://localhost:8080/api/oauth/calendar/callback`

---

### 2. Google Cloud Console Setup Instructions

To enable live Gmail sending and Google Calendar event scheduling, configure a project in Google Cloud Console that you control.

#### Step 1: Create or Select a Google Cloud Project
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **New Project**.
3. Name the project `Atlas Campus AI` and click **Create**.

#### Step 2: Enable Required APIs
1. Go to **APIs & Services > Library**.
2. Search for and enable the following APIs:
   - **Google People API** (or Google Sign-In)
   - **Gmail API**
   - **Google Calendar API**

#### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. User Type: Select **External** (or **Internal** if using a Google Workspace university domain).
3. Fill in the required fields:
   - **App Name:** `ATLAS Campus Multi-Agent AI`
   - **User Support Email:** Your email address
   - **Developer Contact Information:** Your email address
4. Click **Save and Continue**.
5. **Scopes Step:** Click **Add or Remove Scopes** and select:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/calendar.events`
6. Click **Save and Continue**.
7. **Test Users Step (CRITICAL for External Apps in Testing Mode):**
   - Click **Add Users**.
   - Enter your personal Google email address (the one you will sign in with).
   - Click **Add**, then **Save and Continue**.

#### Step 4: Create OAuth 2.0 Web Client Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Application Type: Select **Web application**.
4. Name: `Atlas Local Web Client`.
5. **Authorized JavaScript Origins:**
   - `http://localhost:8080`
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
6. **Authorized Redirect URIs (Enter all three):**
   - `http://localhost:8080/api/oauth/google/callback`
   - `http://localhost:8080/api/oauth/gmail/callback`
   - `http://localhost:8080/api/oauth/calendar/callback`
7. Click **Create**.
8. Copy the generated **Client ID** and **Client Secret**.

---

### 3. Environment Variable Configuration

Create or update your `.env` file in the project root or inside `backend/.env`:

```env
# Server & Origin Configuration
PORT=8080
APP_BASE=http://localhost:8080
FRONTEND_URL=http://localhost:5173

# Google Cloud OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here

# Gemini API Key (for Cloud AI)
GEMINI_API_KEY=your-gemini-api-key-here

# Local Ollama URL
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

---

### 4. How the OAuth Flow Works in ATLAS

```
1. User clicks "Connect Google Account" in Settings > Integrations.
2. Frontend opens window to http://localhost:8080/api/oauth/google
3. Backend generates authorization URL with least-privilege scopes and HMAC state.
4. User authenticates on Google's consent screen.
5. Google redirects back to http://localhost:8080/api/oauth/google/callback?code=...
6. Backend exchanges code for access_token and refresh_token via Google token endpoint.
7. Backend updates backend/data/store.json securely and stores expiration.
8. User is redirected safely to http://localhost:5173/settings?status=success.
```

---

### 5. Verified Security & Fail-Closed Behavior

- **No Mock Tokens Permitted:** In previous versions, mock or simulated tokens could lead to false-positive success claims. The current implementation strictly rejects simulated tokens (`dev_simulated_token`) at the action executor boundary.
- **Fail-Closed Verification:**
  - If a user prompts ATLAS to send an email without having completed OAuth, the system returns:
    `HTTP 400: Gmail not connected. Please connect your Google account in Settings > Integrations.`
  - If a user prompts ATLAS to schedule a meeting without connecting Calendar, the system returns:
    `HTTP 400: Calendar not connected. Please connect Google Calendar in Settings > Integrations.`
- This guarantees ATLAS will never silently fake external actions or fabricate delivery confirmations.
