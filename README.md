# Kryzon CTF Platform

An advanced Capture The Flag (CTF) platform built for cybersecurity competitions, machine creation, and skill development.

## Features

### Core Platform
- **User Management**: Complete authentication system with role-based access control
- **Machine Challenges**: Upload, deploy, and solve virtual machine challenges
- **Progress Tracking**: XP system with levels and category-based statistics
- **Rankings**: Global leaderboards and competitive scoring
- **Real-time Notifications**: Achievement tracking and updates

### Administrative System
- **Dashboard**: Comprehensive analytics and platform metrics
- **Machine Management**: Approval workflow for user-submitted challenges
- **User Administration**: Role assignment and moderation tools
- **Content Moderation**: Review queue for submissions and reports
- **Platform Settings**: Configuration management and security controls

### Creator Tools
- **Machine Creation**: Multi-step upload process for VM/Docker challenges
- **Flag Management**: Multiple flag types and validation
- **Creator Dashboard**: Statistics and management for created machines
- **Version Control**: Track machine iterations and updates

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query + Zustand
- **Routing**: React Router v6
- **Build Tool**: Vite

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/dionebr/kryzon.git
cd kryzon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Database Setup

After configuring environment variables, set up the database:

1. Follow instructions in [DATABASE_SETUP.md](DATABASE_SETUP.md)
2. Run the SQL migration in your Supabase dashboard
3. Create your admin user account

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Route components
supabase/
├── functions/          # Edge Functions
└── config.toml         # Supabase configuration
```

## Database Setup

The platform requires several Supabase tables and functions. Check the `supabase/` directory for:

- Edge Functions for machine management
- Database schema (to be documented)
- Storage buckets for file uploads

## Features in Detail

### Machine Management
- Upload VM/Docker images
- Multiple flag types (static, dynamic, regex)
- Automated testing and validation
- Approval workflow with admin review

### Progress System
- XP-based leveling (Formula: XP = 100 × level^1.5)
- Category-specific progress tracking
- Achievement badges and milestones
- Activity timeline and statistics

### Administrative Controls
- User role management (Admin, Moderator, Creator, User)
- Machine approval/rejection with feedback
- Platform analytics and metrics
- Security monitoring and controls

## Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security concerns, please review our [Security Policy](docs/SECURITY.md) and report vulnerabilities responsibly.

## Documentation

- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute to the project
- [Security Policy](docs/SECURITY.md) - Security guidelines and reporting
- [Development Phases](docs/FASES_5_6_README.md) - Detailed implementation documentation (Portuguese)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Dione Lima**
- Email: dsouzalima438@gmail.com
- GitHub: [@dionebr](https://github.com/dionebr)

## Acknowledgments

- Built with modern React and TypeScript
- UI components from shadcn/ui
- Backend powered by Supabase
- Inspired by popular CTF platforms
