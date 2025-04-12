# Running the Aptos Quiz Platform Locally

This guide will help you run the Aptos Quiz Platform on your local machine.

## The Issue

The project uses Replit-specific Vite plugins that might not work correctly in a local environment. This is why you're seeing the error:

```
Internal server error: injectConfigValues is not a function
```

## Solution: Using a Local Configuration

### Step 1: Use the provided local Vite configuration

We've created a simplified Vite configuration in `vite.config.local.js` that doesn't use the Replit-specific plugins.

### Step 2: Run the backend and frontend separately

Open two terminal windows:

1. In the first terminal, run the backend:
   ```bash
   # On Windows
   set NODE_ENV=development && npx tsx server/index.ts
   
   # On Mac/Linux
   NODE_ENV=development npx tsx server/index.ts
   ```

2. In the second terminal, run the frontend with the local config:
   ```bash
   npx vite --config vite.config.local.js
   ```

### Alternative: Use the start-local.js script

We've also created a helper script that runs both the backend and frontend:

```bash
node start-local.js
```

This script starts both the backend and frontend using the local configuration.

## Environment Variables

We've provided a `.env.local.example` file as a template for your local environment variables:

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit the `.env.local` file with your actual values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A random string for session encryption
   - `APTOS_PRIVATE_KEY`: Your Aptos wallet private key for the platform account

3. Make sure your database is set up and running:
   - Create a PostgreSQL database
   - The schema will be created automatically when you run `npm run db:push`

## Aptos Wallet Integration

For the Aptos wallet integration to work locally:

1. You'll need the Petra wallet browser extension installed
2. Set up the `APTOS_PRIVATE_KEY` environment variable for the platform wallet
3. The app is configured to use the Aptos devnet

---

## Using the Local Package.json File

We've provided a `package.local.json` file that doesn't include Replit-specific dependencies. To use it:

1. Rename it to replace your current package.json:
   ```bash
   # Back up the original first
   mv package.json package.json.replit
   mv package.local.json package.json
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

This will use the `start-local.js` script to run both the backend and frontend servers.

## Reinstalling on Replit

If you need to go back to the Replit version, simply restore the original package.json:
```bash
mv package.json package.json.local
mv package.json.replit package.json
```