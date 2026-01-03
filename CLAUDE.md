# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NFL Division Quiz is a React web application designed to help users learn which teams belong to each NFL division. The app features two interactive modes:

1. **Guess the Division**: Users are presented with a random NFL team and must guess which division it belongs to
2. **Assign Teams**: Users must correctly assign all 32 NFL teams to their respective divisions and receive a score

## Tech Stack

- **Framework**: React 19 with Vite 7
- **Build Tool**: Vite (dev server with HMR)
- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **Node Version**: Module type (ES modules)

## Common Commands

### Development
- `npm run dev` - Start local development server (HMR enabled)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Code Quality

ESLint is configured with recommended rules for React and React Hooks. The setup includes:
- React Hooks rules to catch dependency issues
- React Refresh integration for fast development
- Custom rule: Variables matching pattern `^[A-Z_]` (like component names) are ignored by `no-unused-vars`

To fix linting issues automatically:
```
npx eslint . --fix
```

## Project Structure

```
src/
├── main.jsx          # Application entry point
├── App.jsx           # Root component (main quiz logic)
├── App.css           # Component styles
└── index.css         # Global styles
public/               # Static assets
dist/                 # Production build output (created by `npm run build`)
```

## Key Architecture Decisions

### Data Structure
The NFL divisions data should be stored in a format that supports both quiz modes efficiently. Consider a structure like:
```javascript
const divisions = {
  'AFC East': ['Miami Dolphins', 'New England Patriots', ...],
  'NFC West': [...],
  // etc
}
```

### Component Structure
- **App.jsx** should manage mode selection (Guess vs Assign) and shared state
- Child components should handle individual mode logic to keep concerns separated
- Quiz data (team-division mappings) should be in a separate data file for maintainability

### State Management
React hooks (useState, useEffect) are sufficient for this app's current scope. No external state management library is needed.

## Development Workflow

1. Run `npm run dev` to start the dev server
2. Make changes to components in `src/`
3. Vite will hot-reload changes automatically
4. Before committing, run `npm run lint` to check code quality
5. Build with `npm run build` when ready for production

## Notes

- The ESLint config uses flat config format (not the legacy `.eslintrc`)
- Babel/oxc handles JSX transformation during development
- The React Compiler is not enabled (see README for details on why)
