# SmartCalc AI

All-in-one calculator with a deterministic local calculation engine and optional conversational AI.

## Phase 1

- Expo SDK 58 + React Native 0.88
- TypeScript + Expo Router
- Verified local arithmetic engine
- Percentage calculations
- Recent calculation history in the current session
- Cloud-ready project structure

## Development

```bash
npm install
npm run typecheck
npx expo-doctor
npx expo start
```

## Architecture goals

- Core calculations remain local and deterministic.
- Cloud sync will be added separately from the calculator engine.
- Google Drive will be used for backup/export, not as the primary database.
- AI will be optional and will not be trusted as the source of truth for numeric results.
