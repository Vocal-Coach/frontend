# VocalFlow 🎤

**Find Your Voice** - AI-powered voice coaching app

VocalFlow is a web app that helps you get better at singing. It has step-by-step lessons, real-time help, and different learning paths. If you're new to singing or already good and want to improve, VocalFlow has what you need.

## ✨ Features

### 🎯 Main Features
- **Voice Check**: The app listens to your voice and tells you how you're doing
- **Step-by-Step Learning**: 5 levels from beginner to advanced
- **Different Ways to Learn**: Pick voice check, practice, or learn basics
- **Male and Female Voices**: Different exercises for men and women
- **Login System**: Safe way to create account and sign in

### 🎵 Practice Features
- **Level Exercises**: 
  - Level 1: Simple 5-note scale (Easy)
  - Level 2: Full scale (Basic)
  - Levels 3-5: Hard techniques (Coming Soon)
- **Live Microphone**: App listens to you while you sing
- **Visual Help**: Game-like screen that shows notes
- **Speed Control**: Change how fast or slow the music goes
- **Breathing Practice**: Learn how to breathe better for singing

### 🎨 Easy to Use
- **Clean Design**: Simple, works on phones and computers
- **Easy to Navigate**: Moving between lessons is simple
- **Visual Guides**: Clear pictures and note displays
- **Track Progress**: See how you're getting better

## 🛠 What We Used to Build This

### Website
- **Next.js 14** - Main website framework
- **React 18** - User interface library
- **TypeScript** - Better code writing
- **Tailwind CSS** - Website styling

### Sound & Recording
- **Web Audio API** - Real-time sound processing
- **MediaDevices API** - Microphone access
- **Custom Audio** - Better sound handling

### Design Parts
- **Lucide React** - Icons
- **Custom Components** - Reusable design pieces

### Building Tools
- **ESLint** - Code checking
- **PostCSS** - Style processing
- **Yarn** - Package manager

## 📁 Project Files

```
src/
├── app/                    # Main website pages
│   ├── (pages)/           # App pages
│   │   ├── onboarding/    # Sign up/login
│   │   ├── path-selection/# Pick learning path
│   │   ├── levels/        # Choose level
│   │   ├── practice/      # Practice singing
│   │   ├── evaluate/      # Test your voice
│   │   └── learn/         # Learn basics
│   ├── globals.css        # Main styles
│   ├── layout.tsx         # Page layout
│   └── page.tsx           # Home page
├── components/            # Reusable parts
│   ├── ui/               # Basic design parts
│   ├── layout/           # Layout parts
│   └── features/         # Special features
├── contexts/             # App state
│   └── AuthContext.tsx  # Login state
├── hooks/               # Custom functions
│   ├── useAnimation.ts  # Animation controls
│   ├── useAudioContext.ts # Sound processing
│   ├── useMicrophone.ts # Microphone controls
│   └── useLevelData.ts  # Level info
└── lib/                 # Helper functions
    ├── audio/           # Sound helpers
    ├── animation/       # Animation helpers
    ├── evaluation/      # Voice testing
    ├── levelsData.ts    # Practice levels
    ├── auth.ts          # Login helpers
    └── api.ts           # Connection helpers
```

## 🚀 How to Start

### What You Need
- Node.js 18+ 
- Yarn or npm
- Modern web browser

### Setup

1. **Download the code**
   ```bash
   git clone https://github.com/your-username/vocalflow.git
   cd vocalflow
   ```

2. **Install everything**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start the app**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open in browser**
   Go to [http://localhost:3000](http://localhost:3000)

### Make it Ready for Everyone

```bash
yarn build
yarn start
```

## 🎯 How to Use

### Getting Started
1. **Welcome Page**: Learn about VocalFlow
2. **Sign Up/Login**: Create account or sign in
3. **Pick Your Path**: Choose how you want to learn:
   - **Test My Voice**: Check how good you are now
   - **Practice**: Do singing exercises
   - **Learn Basics**: Learn the basics of singing

### Practice Time
1. **Pick Level**: Choose how hard you want it (1-5)
2. **Pick Voice Type**: Choose male or female voice
3. **Turn On Microphone**: Let the app listen to you
4. **Follow the Screen**: Practice with the game-like display
5. **See Progress**: Watch yourself get better

### Voice Testing
- App listens to your pitch
- Checks your voice range
- Tests sound quality
- Gives you personal feedback

## 🔧 For Developers

### Commands You Can Use

```bash
# Development
yarn dev          # Start development
yarn build        # Build for release
yarn start        # Start finished app
yarn lint         # Check code

# Check types
yarn type-check   # Check TypeScript
```

### Important Parts

- **Login System**: Safe user accounts
- **Sound Processing**: Real-time pitch checking
- **Practice System**: Level-based exercises
- **Visual Help**: Interactive note display
- **Mobile Friendly**: Works on phones and computers

### How to Help

1. Copy the repository
2. Make your feature branch (`git checkout -b feature/amazing-feature`)
3. Save your changes (`git commit -m 'Add some amazing feature'`)
4. Upload changes (`git push origin feature/amazing-feature`)
5. Ask to merge your changes

## 🔮 Future Plans

### What We Have Now
- ✅ Login system
- ✅ Level 1 & 2 practice
- ✅ Real-time microphone
- ✅ Visual feedback
- ✅ Male/female voice options

### What's Coming Next
- 🔄 Advanced levels (3-5)
- 🔄 Better voice testing
- 🔄 Progress tracking
- 🔄 Social features and sharing
- 🔄 Phone app
- 🔄 More breathing exercises
- 🔄 Different music styles

## 📄 License

This project uses the MIT License - see the [LICENSE](LICENSE) file for more info.

## 🤝 Help & Support

For questions or problems:
- Make an issue on GitHub
- Contact our team
- Join community talks

---

**VocalFlow** - Helping voices, one note at a time 🎵