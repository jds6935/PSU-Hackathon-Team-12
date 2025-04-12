export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // Ensure this property exists
  sets: number;
  reps: number;
  weight: string | number;
  weightUnit?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  displayDate: string;
  exercises: Exercise[];
  notes?: string;
  xpGained: number;
}

export interface FriendProfile {
  id: string;
  name: string;
  rank: string;
  xp: number;
  nextRankXp: number;
  streak: number;
  totalWorkouts: number;
  joined: string;
  avatar: string;
  lastActive?: string;
  status?: "online" | "offline";
}
