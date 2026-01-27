# Personal Execution System

A distraction-free web application designed to transform insights from transformational books (Think and Grow Rich, The 5 AM Club) into consistent daily behaviors, reinforced beliefs, and observable progress over time.

## Purpose

This system helps you:
- Translate book insights into daily practices
- Reinforce core beliefs through repetition
- Track adherence and progress over time
- Maintain discipline through structured routines
- Reflect weekly on energy, effectiveness, and goal progress

## Features

### 🌅 Morning View
- Display your Faith Statement (read twice daily with conviction)
- Review your Definite Chief Aim (burning desire and purpose)
- Track daily morning practices from The 5 AM Club and Think and Grow Rich:
  - 5 AM wake-up
  - 20/20/20 Formula (Move, Reflect, Grow)
  - Visualization and gratitude
  - Autosuggestion and specialized knowledge study

### 🌙 Evening View
- Second reading of Faith Statement
- Daily progress summary
- Evening practices and reflection
- Review what you accomplished toward your chief aim

### 📊 Dashboard
- Weekly adherence tracking with visual metrics
- Daily completion rates and patterns
- Practice heatmap showing consistency
- Current streak tracking

### 💭 Book Insights
- Capture key principles, practices, and quotes
- Filter by book
- Organize by category

### ⚙️ Settings
- Edit core statements (Faith Statement, Chief Aim, Morning Commitments)
- View complete version history with timestamps
- Track evolution of your understanding over time

### 📝 Weekly Reflection
- Rate personal energy (1-10)
- Assess effectiveness (1-10)
- Measure progress toward goals (1-10)
- Document wins and improvements
- Track feelings about adherence

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: localStorage (browser-based)
- **Deployment Ready**: Can be deployed to Vercel, Netlify, or any static host

## Getting Started

### Prerequisites
- Node.js 18+ installed on your machine

### Installation

1. Navigate to the project directory:
```bash
cd execution-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### First-Time Setup

When you first open the app:

1. Go to **Settings** to set your core statements:
   - Faith Statement
   - Definite Chief Aim
   - Morning Commitments

2. The default practices from both books are already configured

3. Start checking off practices in the **Morning** and **Evening** views

4. Review your progress in the **Dashboard**

5. Complete your **Weekly Reflection** at the end of each week

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ Complete privacy - your data never leaves your machine
- ✅ No account or login required
- ✅ Fast and responsive
- ⚠️ Data is tied to this browser - use export/import if switching devices
- ⚠️ Clearing browser data will delete your information

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy your app

Your app will be accessible on your phone and any device via the provided URL.

### Build for Production

```bash
npm run build
npm run start
```

## Usage Tips

### Daily Routine
- **Morning**: Open the Morning view at 5 AM, read your statements, check off practices
- **Evening**: Review your day, complete evening practices, write reflection notes

### Weekly Discipline
- **Sunday Evening** or **Monday Morning**: Complete your weekly reflection
- Be honest about energy, effectiveness, and progress
- Document wins and set improvement intentions

### Statement Evolution
- Refine your Faith Statement and Chief Aim as your understanding deepens
- Version history preserves all changes
- Update when you have genuine insights, not for the sake of change

### Book Insights
- Add key learnings as you read
- Review insights periodically to reinforce concepts
- Use categories to organize different types of content

## Key Performance Indicators (KPIs)

The system tracks:
- **Days per week** you complete at least one practice
- **Adherence percentage** for all daily practices
- **Streak length** of consistent execution
- **Weekly reflection completion** rate
- **Statement evolution** frequency and depth

Success is measured by:
- Consistency over intensity
- Subjective clarity and focus
- Observable follow-through on your chief aim
- Embodiment of principles in daily action

## Customization

You can customize:
- Core statements (via Settings)
- Add practices (edit `lib/seed-data.ts`)
- Add more statement types (edit `lib/types.ts`)
- Modify styling (Tailwind classes throughout)

## Philosophy

This tool is designed for:
- High-performing, intellectually curious leaders
- Those who read for growth and value depth over volume
- People who want low-friction, distraction-free support for discipline
- Individuals committed to belief conditioning and consistent action

It is NOT:
- A productivity tracker with endless features
- A social or competitive platform
- A replacement for the books themselves

## Support

For questions or improvements, open an issue in the repository.

---

**Remember**: The system is a tool. Your discipline, consistency, and embodiment of these principles is what creates transformation. Use it daily, reflect weekly, and stay committed to your chief aim.
