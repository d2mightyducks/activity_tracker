# Insurance Agent Tracker

A comprehensive performance tracking and analytics platform for insurance agencies.

## Features

### For Agents
- **Daily Activity Logging**: Track dials, pick-ups, quotes, and applications
- **Conversion Funnel Visualization**: See your performance metrics in real-time
- **Application Management**: Log deals and track premiums
- **Personal Dashboard**: View today's stats, weekly trends, and monthly performance

### For Managers
- **Team Overview**: Monitor all agents' performance at a glance
- **Agent Signup Links**: Generate unique links for onboarding agents to your team
- **Performance Leaderboards**: See top performers ranked by applications
- **Red Flags Dashboard**: Identify agents needing attention (low activity, no policies, etc.)
- **Individual Agent Deep Dive**: Compare agents month-over-month with detailed breakdowns

### For Super Admins
- **Manager Invitations**: Onboard new managers with credentials
- **System Overview**: View total managers and agents across the platform
- **Complete Visibility**: Access to all managers and agents

## Tech Stack

- **Frontend**: React with React Router
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **Deployment**: Vercel
- **Styling**: Custom CSS

## Getting Started

See `DEPLOYMENT.md` for complete deployment instructions.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

3. Start development server:
```bash
npm start
```

## Database Schema

The application uses 4 main tables:
- `profiles`: User accounts (agents, managers, super_admin)
- `activity_logs`: Daily activity tracking with auto-calculated fields
- `applications`: Deal/policy entries
- `manager_signup_codes`: Unique signup codes for manager-specific onboarding

See `supabase-schema.sql` for complete schema with triggers and RLS policies.

## Key Features Explained

### Auto-Calculation
When an agent adds an application, the system automatically:
- Increments the applications count for that date
- Increments the closed count for that date
- Adds the premium to the total premium for that date

This is handled by database triggers, so the data stays consistent.

### Row Level Security
- Agents can only see their own data
- Managers can only see their assigned agents' data
- Super admins can see everything

This is enforced at the database level, making it secure by design.

### Manager Signup Links
Each manager gets a unique code that agents can use to automatically join their team during signup.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ActivityLogger.js
│   ├── ApplicationEntry.js
│   ├── ConversionFunnel.js
│   ├── TodayStats.js
│   └── AgentDetailModal.js
├── pages/              # Route pages
│   ├── Login.js
│   ├── Signup.js
│   ├── AgentDashboard.js
│   ├── ManagerDashboard.js
│   └── SuperAdminDashboard.js
├── AuthContext.js      # Authentication context
├── supabaseClient.js   # Supabase configuration
└── App.js              # Main app with routing
```

## Roadmap

### v1.1 (Next)
- Chrome Extension for quick activity tallies
- Bookmark widget for one-click logging

### v1.2 (Future)
- System-wide benchmarks with color coding (red/yellow/green)
- Goal setting and tracking
- Performance trends visualization

### v2.0 (Future)
- Expense and commission tracking
- Client database with full CRM features
- Ad spend and ROI tracking
- Email/SMS notifications
- Mobile app (iOS/Android)

## Support

For issues or questions, contact Paul at pauldmiller3@gmail.com
