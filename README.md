# Youth Health Analytics Dashboard

A modern Next.js web application for youth health analytics with a beautiful login interface and dashboard.

## Features

- 🏠 Beautiful home page with login functionality
- 📊 Dashboard with health analytics overview
- 🔐 Secure authentication flow
- 📱 Responsive design for all devices
- 🎨 Modern UI with Tailwind CSS
- ⚡ Next.js 14 with App Router
- 🚀 Server-side rendering and optimization

## Getting Started

### Prerequisites

- **Node.js (v18 or higher)** - Download from [nodejs.org](https://nodejs.org/)
- npm (comes with Node.js)

### Installation Steps

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Run the installer
   - Restart your terminal/command prompt after installation

2. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Troubleshooting

**If "npm is not recognized":**
- Make sure Node.js is installed
- Restart your terminal/command prompt
- Check if Node.js is in your system PATH

**If the site shows a blank page:**
- Check the browser console for errors (F12)
- Make sure the dev server is running (`npm run dev`)
- Try clearing browser cache

**If dependencies fail to install:**
- Delete `node_modules` folder (if exists)
- Delete `package-lock.json` (if exists)
- Run `npm install` again

**Port 3000 already in use:**
- Next.js will automatically use the next available port
- Or specify a different port: `npm run dev -- -p 3001`

### Building for Production

```bash
npm run build
npm start
```

The built files will be optimized for production.

## Usage

- Enter any email and password to login (demo mode)
- After login, you'll be redirected to the dashboard
- Use the logout button to return to the login page

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- App Router

## Project Structure

```
app/
  ├── layout.tsx          # Root layout
  ├── page.tsx            # Home/login page
  ├── dashboard/
  │   └── page.tsx        # Dashboard page
  └── globals.css         # Global styles
```
