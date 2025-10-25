# Claude Proxy (local)

This is a minimal Express proxy to call the Claude / Anthropic API from a mobile app without embedding your API key in the client.

## Setup

1. Copy `.env.example` to `.env` and set `CLAUDE_API_KEY`.

2. Install dependencies and run:

```bash
cd server
npm install
npm start
```

The server listens on port 3000 by default. The mobile app code in `app/(tabs)/index.tsx` uses `http://localhost:3000/claude` for iOS simulator and `http://10.0.2.2:3000/claude` for Android emulator.

## Testing from a physical device

- Use `ngrok http 3000` (or any reverse tunnel) and then set the mobile client to point to the forwarded URL.

## Security

- Do not commit your real API key into source control.
- Add rate limiting and auth if you expose this to public networks.

## Notes

- Adjust request body or headers in `claude-proxy.js` depending on the exact Claude/Anthropic API version you use. The shape of the response can vary by model and vendor.
