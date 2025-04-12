# 🐺 Wolf Gym - Fitness Tracker Application

Wolf Gym is a gamified fitness tracking application that helps users log workouts, track progress, and stay motivated through a wolf-themed ranking system. Built during the PSU Hackathon, this app combines workout tracking with gamification elements to make fitness fun and engaging.

## 🚀 Features

- **Workout Tracking**: Log exercises, sets, reps, and weight for each workout session
- **Progress Visualization**: View your progress over time with statistics and charts
- **Wolf Rank System**: Progress through different wolf ranks as you earn XP from workouts
- **Streak Counter**: Keep track of consecutive workout days for additional motivation
- **Calendar View**: See your workout history in a calendar format
- **Pack System**: Connect with friends to form a pack and motivate each other
- **User Profiles**: Customize your profile and view your achievements

## 🏆 Wolf Rank Progression

As you complete workouts and earn XP, you'll progress through these wolf ranks:
- Baby Pup
- Puplet
- Runt
- Straight Up Dawg
- Respectable Wolf
- Beta Wolf
- Alpha Wolf
- Sigma Wolf
- Super Mega Deluxe Ultra Sigma Nonchalant Wolf

Each rank comes with its own unique badge icon to showcase your progress!

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Query
- **Backend & Authentication**: Supabase
- **Routing**: React Router
- **Form Handling**: React Hook Form, Zod
- **Date Manipulation**: date-fns
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database and authentication)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/PSU-Hackathon-Team-12.git
   cd PSU-Hackathon-Team-12
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application

## 📱 Application Structure

- **Dashboard**: View your stats, recent workouts, and current rank
- **Workouts**: Log and view detailed workout history
- **Calendar**: Visualize your workout frequency
- **Pack**: Connect with friends and see their progress
- **Profile**: Manage your profile and view achievements

## 🧠 Database Schema

The application uses the following main tables in Supabase:
- Users: User profiles and authentication
- Workouts: Workout sessions data
- Exercises: Individual exercises within workouts
- Achievements: User achievements and progress
- Rank Progressions: XP thresholds for different ranks

## 🤝 Team Members

This project was created by Team 12 during the PSU Hackathon.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
