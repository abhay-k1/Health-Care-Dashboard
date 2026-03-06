# Youth Health Analytics Dashboard

A vanilla HTML/CSS/JS frontend web application for youth health analytics and assessments. This project does not use any frontend frameworks (like React or Next.js) or build tools.

## Getting Started

### Prerequisites
A modern web browser (Chrome, Firefox, Safari, Edge) is all you need.

### Installation & Running

1. **Clone or Download the repository**
2. **Open `index.html`** in your browser.
   - Simply double-click the `index.html` file, or drag and drop it into your browser.
   - No `npm install` or `npm run dev` commands are required.

## Features

- **Responsive Landing Page:** Includes hero section, government policies, and an integrated login portal.
- **Glassmorphism Design:** Modern aesthetic using CSS backdrop filters.
- **Mock Authentication:** Password and OTP login simulation using `localStorage`.
- **Admin Dashboard:** Visualizes mock user health data using Chart.js.
- **Dynamic Questionnaires:** Generates varied questions based on selected demographics.

## Tech Stack
- Plain HTML5
- Plain CSS3 (Vanilla, no preprocessors)
- Vanilla JavaScript (ES6+)
- Chart.js (Loaded via CDN in specific files)
- LocalStorage APIs (for session and state management)

## Project Structure
- `index.html` - The main landing page and admin login portal.
- `user-login.html` - Login portal for participants.
- `researcher-login.html` - Login portal for researchers.
- `dashboard.html` - User dashboard after logging in.
- `questionnaire.html` - Health assessment questionnaire.
- `admin-analytics.html` - The admin dashboard view.
- `admin-analytics.js` - Mock data generation and charting logic.
- `README.md` - Project documentation.

## Demo Credentials
You can use any email and password for testing, but the suggested admin credentials are:
- **Email:** admin@health.com
- **Password:** admin123
