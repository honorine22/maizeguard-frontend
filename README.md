# MaizeGuard Frontend

Next.js web interface for MaizeGuard Rwanda. It uploads maize images to the backend model API and displays the predicted class, confidence, risk level, and recommendation.

## Local Run

```bash
cd capstone-frontend
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

```text
NEXT_PUBLIC_MODEL_API_URL=http://127.0.0.1:8000
```

For deployment, set `NEXT_PUBLIC_MODEL_API_URL` to your deployed backend base URL, for example:

```text
NEXT_PUBLIC_MODEL_API_URL=https://maizeguard-backend-419n.onrender.com/
```

## Deployment

Recommended quick deployment: Vercel.

Use:

```text
Root directory: capstone-frontend
Build command: npm run build
Output: Next.js default
```

Set the `NEXT_PUBLIC_MODEL_API_URL` environment variable before deploying.
# maizeguard-frontend
