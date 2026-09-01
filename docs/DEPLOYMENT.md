# DEPLOYMENT GUIDE — NETLIFY & CLOUD HOSTING
# RIFTBOUND: ECHOES OF THE AETHER

---

## ⚡ Method 1: Instant 30-Second Netlify Drop (No Terminal Needed)

The production build has already been generated at:
`C:\Users\Rentsher\.gemini\antigravity\scratch\riftbound\mobile\dist`

1. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your web browser.
2. Log in (or sign up for free).
3. Drag & drop the entire **`dist`** folder from `C:\Users\Rentsher\.gemini\antigravity\scratch\riftbound\mobile\dist` directly into the Netlify Drop area on the web page.
4. ✨ **Your game is immediately live with an SSL HTTPS URL** (e.g. `https://riftbound.netlify.app`)!

---

## 🚀 Method 2: Netlify CLI (1 Command)

If you have Node/npm installed:

```powershell
cd C:\Users\Rentsher\.gemini\antigravity\scratch\riftbound\mobile

# Deploy directly to Netlify production
npx netlify-cli deploy --prod --dir=dist
```
Follow the interactive prompt to authorize and select your site name.

---

## 🐙 Method 3: GitHub / GitLab Continuous Deployment (CI/CD)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Riftbound release"
   git remote add origin https://github.com/YOUR_USERNAME/riftbound.git
   git push -u origin main
   ```
2. In Netlify Dashboard, click **"Add new site"** > **"Import an existing project"** > Choose **GitHub**.
3. Select your repository.
4. Netlify will automatically detect the root `netlify.toml` settings:
   - **Base directory:** `mobile`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**. Every future `git push` will automatically build and deploy!

---

## 🌐 Connecting a Live Backend (Optional)

The game is designed with a **self-contained offline state store** (`localStorage`), meaning it runs 100% standalone on Netlify with full combat, elemental synergies, hero roster, forge upgrades, and victory card downloads out-of-the-box!

If you also want global live multiplayer leaderboards and server anti-cheat across all players:
1. Deploy the `backend/` folder on a free hosting platform like **[Render.com](https://render.com)**, **[Railway.app](https://railway.app)**, or **[Fly.io](https://fly.io)**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. In Netlify's **Site settings** > **Environment variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-service.onrender.com/api/v1`
3. Trigger a redeploy on Netlify.
