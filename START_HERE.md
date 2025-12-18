# 🃏 MAGIC CARD BROWSER - QUICK START GUIDE

## ⚡ 3-Step Quick Start

```bash
1. cd to the proper directory

2. npm install

3. npm run dev
```

Then open: **http://localhost:3000**

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Full overview |
| QUICKSTART.md | Quick reference |
| SETUP.md | Detailed guide |
| IMPLEMENTATION.md | Technical details |
| API_REFERENCE.md | API info |
| FILE_STRUCTURE.md | File descriptions |
| COMPLETE.md | Summary & checklist |

👆 Read any of these for help

---

## 💻 Commands

```bash
npm install          # Install dependencies (run first!)
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code
```
---

## 🚀 Deployment

### Local
```bash
npm run dev          # Development
npm run build && npm start  # Production
```

### Online (Vercel - Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, done!
```

---

## ❓ Common Issues

**Port 3000 in use?**
```bash
# Windows: Kill process
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux: Kill process
lsof -i :3000
kill -9 [PID]
```

**npm not found?**
- Install Node.js: https://nodejs.org/
- Restart terminal
- Try again

---

## 🎓 Learning

**Want to customize?**
1. Read SETUP.md
2. Edit tailwind.config.ts for colors
3. Edit components for layout
4. Edit lib/api.ts for filters

**Want to deploy?**
1. Read SETUP.md deployment section
2. Choose hosting (Vercel, Docker, etc)
3. Follow provider instructions

**Need API help?**
1. Read API_REFERENCE.md
2. Check https://scryfall.com/docs/api
3. Try example queries in browser

---

## 📞 Help

1. **Quick Help?** → Read QUICKSTART.md
2. **Setup Issues?** → Read SETUP.md
3. **Code Help?** → Read IMPLEMENTATION.md
4. **API Help?** → Read API_REFERENCE.md
5. **File Help?** → Read FILE_STRUCTURE.md