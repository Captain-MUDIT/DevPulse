# Dev Pulse - Modern News Aggregation Platform

A modern, minimalistic news website interface tailored for founders, tech enthusiasts, and developers.

## Features

- 🎨 **Modern UI Design** - Sleek, minimalistic interface with glassmorphism effects
- 🌓 **Dark/Light Mode** - Toggle between themes with smooth transitions
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🎭 **Smooth Animations** - Powered by Framer Motion
- 🔍 **Search & Filter** - Search articles and filter by categories
- 📊 **Category System** - Business, Tech, Papers, Patents
- ⚡ **Fast Performance** - Built with React 19 and Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://127.0.0.1:8000`):
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Tech Stack

- **React 19** - UI Framework
- **Vite** - Build tool
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **date-fns** - Date formatting

## Project Structure

```
src/
├── components/     # React components
├── context/        # React context (Theme)
├── api/            # API utilities
├── styles/         # CSS stylesheets
└── App.jsx         # Main app component
```

## Features in Detail

### Categories
- **All** - Shows all articles
- **Business** - Startups, Funding, Business news
- **Tech** - AI, Technology news
- **Papers** - Research papers
- **Patents** - Patent news

### Animations
- Page load fade-in with staggered cards
- Smooth hover effects on cards
- Category tab transitions
- Scroll animations
- Theme toggle animation

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://127.0.0.1:8000)

## License

MIT
