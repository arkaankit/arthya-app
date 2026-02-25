# ⚡ Quick Deploy Checklist

Copy and paste these commands in your terminal:

## 1️⃣ Initialize Git & Commit

```bash
git init
git add .
git commit -m "Initial commit: Arthya - Smart Financial Planning Platform"
```

## 2️⃣ Create GitHub Repository

Go to: https://github.com/new

- Repository name: `arthya`
- Visibility: Public or Private
- **Don't** initialize with README
- Click "Create repository"

## 3️⃣ Push to GitHub

**Replace YOUR_USERNAME with your GitHub username:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/arthya.git
git branch -M main
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johnsmith/arthya.git
git branch -M main
git push -u origin main
```

## 4️⃣ Deploy to Vercel

### Via Website (Easiest):

1. Go to: https://vercel.com/new
2. Sign up/Login with GitHub
3. Click "Import" on your `arthya` repository
4. Click "Deploy" (all settings auto-detected)
5. Wait 1-2 minutes
6. Done! 🎉

### Via CLI (Alternative):

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 5️⃣ Access Your App

Your app will be live at:
```
https://arthya.vercel.app
```

Or similar URL shown in Vercel dashboard.

---

## 🔄 Update Your App Later

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys! ✨
```

---

## ✅ That's It!

Your app is now:
- ✅ Live on the internet
- ✅ Auto-deploys on every push
- ✅ HTTPS enabled
- ✅ Globally distributed (CDN)
- ✅ Free!

---

**Total Time: ~5-10 minutes** ⚡

For detailed guide, see `DEPLOYMENT_GUIDE.md`
