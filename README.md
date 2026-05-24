# Apex Clinical Intelligence Platform

This is the medical director and administrator dashboard for Apex Healthcare LLC, connecting to PointClickCare (PCC).

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui components
- TypeScript

## Local Development
1. `npm install`
2. `npm run dev`

Open [http://localhost:3000](http://localhost:3000)

## PCC API Integration
Currently running on mock data. To connect to real PCC data, add the following to your `.env.local`:
```
PCC_CLIENT_ID=your_client_id
PCC_CLIENT_SECRET=your_client_secret
PCC_BASE_URL=https://api.pointclickcare.com
```

The system will automatically switch from mock data to real data when these variables are present (zero code changes required).

## Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add the `PCC_` environment variables in Vercel settings
4. Deploy
