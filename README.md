# Aishwarya Silam
# Assignment 3

## Track Em (A Habit Tracker)
## Render Link: https://a3-aishwaryasilam-1.onrender.com 

## Project Summary
A full-stack webpage that helps users create, track, and manage their personal habits. Key aspects of this application include a secure dashboard where users can track habits, customize frequencies, and update/delete entries. A separate user login and registration page allows for a clean, minimal, and intuitive user experience. This approach allows a clean separation with the Mongoose models and a much more reliable session management system. Using **Bootstrap 5** and **Google Fonts** allowed for a minimalist and clean theme while maintianig professionalism.

## Technical Achievements
  1. **`express-session`**: Manages user session state and cookies across HTTP requests.
  2. **`mongoose`**: Provides schema-based object data modeling for MongoDB, structuring user and habit records.
  3. **`dotenv`**: Loads environment variables securely from a `.env` file into `process.env` to protect database credentials.
  4. **`connect-mongo`**: Stores Express session data directly in MongoDB, ensuring sessions persist across server restarts.

### Design/Evaluation Achievements
- **Contrast (Dark Mode)**: Allows for much more contrast and stylistically draws users eyes to importnat elements (i.e. create habit, login, register, etc.)
- **Repetition (Design elements)**: Design elements are used consistently across all views (`login.ejs`, `register.ejs`, and `dashboard.ejs`). The card components (`card shadow-sm text-bg-dark`) and typography are used consistently to maintain uniformity.
- **Alignment**: Uniformity of left-aligned form labels, table cells, and structured card layouts helps to create a scannable vertical rhythm, guiding the users eye naturally makign the webpage have a very intuitive feel.
- **Proximity**: Related elements (i.e. Update, Delete) are grouped closely together within Bootstrap grid columns. Intuitively helping users see the functional relationships amongst elements.
