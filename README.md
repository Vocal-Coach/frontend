# VocalFlow

VocalFlow is an AI-powered, personalized vocal coaching application designed to help users improve their vocal abilities. This application provides step-by-step practice environments accessible anytime, anywhere, along with intuitive visual feedback for vocal skill enhancement.

## Features

- **User Onboarding**: Welcome screen with introduction and path selection to guide new users
- **Practice Level Selection**: Multiple difficulty levels for progressive learning
- **Level-Specific Practice**: Interactive practice screens with visual guidance for pitch, timing, and duration
- **Range Options**: Support for both male and female vocal ranges
- **Visual Feedback**: Rhythm game-style UI for engaging and effective practice

## Development

This project is built with:

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

The application follows a component-based architecture:

- `/src/app/(pages)`: Main pages (Welcome, Path Selection, Levels, Practice)
- `/src/app/components/ui`: General, reusable UI components
- `/src/app/components/layout`: Layout components
- `/src/app/components/features`: Feature-specific components
- `/src/app/lib`: Utility functions and data

## MVP Scope

The current MVP includes:

- Welcome screen
- Path selection screen
- Level selection screen
- Practice screens for Level 1 (5-Tone Scale) and Level 2 (Major Scale)
- Range selection functionality
- Basic controls for practice sessions (play, pause, restart, stop)

## Future Enhancements

- Advanced practice features including Levels 3-5
- Real-time pitch detection using Web Audio API
- "Evaluate My Voice" feature for range measurement and pitch testing
- "Learn Basics" content with vocalization and breathing techniques
- User profiles with practice history and progress tracking