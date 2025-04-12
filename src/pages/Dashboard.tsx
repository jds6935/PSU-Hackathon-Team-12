import { useState } from "react";
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Plus 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

import RankBadge from "@/components/RankBadge";
import StreakCounter from "@/components/StreakCounter";
import StatCard from "@/components/StatCard";
import WorkoutForm from "@/components/WorkoutForm";
import { CustomProgress } from "@/components/ui/custom-progress";
import { Workout } from "@/types/workout";

const Dashboard = () => {
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const navigate = useNavigate();

  const user = {
    name: "",
    rank: "",
    xp: 0,
    nextRankXp: 0,
    streak: 0,
    totalWorkouts: 0,
    joined: "",
    avatar: ""
  };

  const stats = {
    workoutsThisWeek: 0,
    workoutsLastWeek: 0,
    weightLifted: "",
    weightChange: {
      value: 0,
      positive: true
    }
  };

  const recentWorkouts: Workout[] = [];
  const todayXP = 0;
  const xpToEarn = 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wolf-silver">Dashboard</h1>
        <p className="text-wolf-silver/60">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User profile card */}
        <Card className="col-span-1 md:col-span-4 glass-card border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Your Profile</CardTitle>
            <CardDescription className="text-wolf-silver">Member since {user.joined}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-wolf-purple mb-4">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3">{user.name}</h2>
              
              <RankBadge 
                rank={user.rank}
                xp={user.xp}
                nextRankXp={user.nextRankXp}
                className="mb-6"
              />
              
              <div className="w-full bg-wolf-charcoal rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-wolf-silver text-sm">Today's XP</span>
                  <span className="text-wolf-purple font-medium">{todayXP}/{xpToEarn}</span>
                </div>
                <CustomProgress 
                  value={(todayXP / xpToEarn) * 100} 
                  className="h-2 bg-wolf-dark" 
                  indicatorClassName="bg-wolf-purple" 
                />
              </div>
              
              <StreakCounter streak={user.streak} />
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            title="Workouts This Week"
            value={stats.workoutsThisWeek}
            icon={<Dumbbell className="h-5 w-5" />}
            change={
              stats.workoutsLastWeek
                ? {
                    value: Math.round(
                      ((stats.workoutsThisWeek - stats.workoutsLastWeek) /
                        stats.workoutsLastWeek) *
                        100
                    ),
                    positive:
                      stats.workoutsThisWeek >= stats.workoutsLastWeek,
                  }
                : undefined
            }
          />
          
          <StatCard
            title="Current Streak"
            value={`${user.streak} days`}
            icon={<Flame className="h-5 w-5" />}
          />
          
          <StatCard
            title="Total Weight Lifted"
            value={stats.weightLifted}
            icon={<TrendingUp className="h-5 w-5" />}
            change={stats.weightChange}
          />
          
          <StatCard
            title="Total Workouts"
            value={user.totalWorkouts}
            icon={<Trophy className="h-5 w-5" />}
          />

          {/* Quick Add Workout Button */}
          <div className="col-span-1 sm:col-span-2 mt-2">
            <Button
              onClick={() => setShowWorkoutDialog(true)}
              className="w-full h-14 bg-wolf-purple hover:bg-wolf-accent text-wolf-dark flex items-center justify-center text-lg"
            >
              <Plus className="mr-2 h-5 w-5" /> Log Today's Workout
            </Button>
          </div>
        </div>

        {/* Recent workouts */}
        <Card className="col-span-1 md:col-span-12 glass-card border-none shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">Recent Workouts</CardTitle>
              <CardDescription className="text-wolf-silver">Your latest training sessions</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              className="text-wolf-purple hover:text-wolf-accent hover:bg-wolf-charcoal"
              onClick={() => navigate("/workouts")}
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] w-full pr-4">
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center p-3 hover:bg-wolf-charcoal/50 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-wolf-purple/10 rounded-md mr-4">
                      <Dumbbell className="h-5 w-5 text-wolf-purple" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{workout.name}</h4>
                      <p className="text-sm text-wolf-silver">
                        {workout.exercises.length} exercises • {workout.xpGained} XP
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{workout.displayDate}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-wolf-purple text-xs hover:bg-wolf-purple/10"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick add workout dialog */}
      <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">Log Workout</DialogTitle>
          </DialogHeader>
          <WorkoutForm onComplete={() => setShowWorkoutDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
