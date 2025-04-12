import { useState, useEffect } from "react";
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
import supabase from "@/lib/supabaseClient";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

import RankBadge from "@/components/RankBadge";
import StreakCounter from "@/components/StreakCounter";
import StatCard from "@/components/StatCard";
import WorkoutForm from "@/components/WorkoutForm";
import { CustomProgress } from "@/components/ui/custom-progress";
import { Workout } from "@/types/workout";

const Dashboard = () => {
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    displayName: "",
    rank: "Novice", // Default rank
    xp: 0,
    nextRankXp: 100, // Default next rank XP
    streak: 0,
    totalWorkouts: 0,
    joined: "",
    avatar: "https://ui-avatars.com/api/?name=Wolf&background=6c5dd3&color=191a23&size=128"
  });

  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    workoutsLastWeek: 0,
    weightLifted: "0 kg",
    weightChange: {
      value: 0,
      positive: true
    }
  });

  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [todayXP, setTodayXP] = useState(0);
  const [xpToEarn, setXpToEarn] = useState(50); // Default daily XP goal

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate("/login");
          return;
        }

        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError) throw userError;

        // Fetch user's total workouts count
        const { count: totalWorkouts, error: countError } = await supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id);

        if (countError) throw countError;

        // Fetch user's total XP
        const { data: xpData, error: xpError } = await supabase
          .from('workouts')
          .select('xp_gained')
          .eq('user_id', authUser.id);

        if (xpError) throw xpError;

        const totalXP = xpData.reduce((sum, workout) => sum + (workout.xp_gained || 0), 0);

        // Fetch rank data to determine current rank and next rank
        const { data: ranksData, error: ranksError } = await supabase
          .from('rank_progressions')
          .select('*')
          .order('min_xp', { ascending: true });

        if (ranksError) throw ranksError;

        // Determine current rank and next rank
        let currentRank = "Novice";
        let nextRankXp = 100;

        if (ranksData && ranksData.length > 0) {
          for (let i = 0; i < ranksData.length; i++) {
            if (totalXP >= ranksData[i].min_xp && 
               (i === ranksData.length - 1 || totalXP < ranksData[i + 1].min_xp)) {
              currentRank = ranksData[i].rank;
              nextRankXp = i < ranksData.length - 1 ? ranksData[i + 1].min_xp : ranksData[i].min_xp + 100;
              break;
            }
          }
        }

        // Get current week's workouts
        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today);
        const endOfCurrentWeek = endOfWeek(today);

        const { data: currentWeekWorkouts, error: currentWeekError } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', authUser.id)
          .gte('date', format(startOfCurrentWeek, 'yyyy-MM-dd'))
          .lte('date', format(endOfCurrentWeek, 'yyyy-MM-dd'));

        if (currentWeekError) throw currentWeekError;

        // Get last week's workouts
        const startOfLastWeek = startOfWeek(subDays(today, 7));
        const endOfLastWeek = endOfWeek(subDays(today, 7));

        const { data: lastWeekWorkouts, error: lastWeekError } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', authUser.id)
          .gte('date', format(startOfLastWeek, 'yyyy-MM-dd'))
          .lte('date', format(endOfLastWeek, 'yyyy-MM-dd'));

        if (lastWeekError) throw lastWeekError;

        // Calculate streak (simplified implementation)
        const { data: streakData, error: streakError } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', authUser.id)
          .order('date', { ascending: false });

        if (streakError) throw streakError;

        let streak = 0;
        if (streakData && streakData.length > 0) {
          const sortedDates = streakData.map(w => new Date(w.date)).sort((a, b) => b.getTime() - a.getTime());
          const latestWorkoutDate = new Date(sortedDates[0]);
          const todayDate = new Date();
          
          // Check if the latest workout is from today or yesterday
          const isRecent = (
            format(latestWorkoutDate, 'yyyy-MM-dd') === format(todayDate, 'yyyy-MM-dd') ||
            format(latestWorkoutDate, 'yyyy-MM-dd') === format(subDays(todayDate, 1), 'yyyy-MM-dd')
          );
          
          if (isRecent) {
            streak = 1;
            // Simple consecutive days check
            for (let i = 1; i < sortedDates.length; i++) {
              const currentDay = sortedDates[i];
              const previousDay = sortedDates[i-1];
              const dayDiff = Math.round((previousDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));
              
              if (dayDiff <= 1) {
                streak++;
              } else {
                break;
              }
            }
          }
        }

        // Calculate total weight lifted
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select(`
            weight,
            weight_unit,
            sets,
            reps,
            workouts!inner (
              user_id
            )
          `)
          .eq('workouts.user_id', authUser.id);

        if (exercisesError && exercisesError.code !== 'PGRST116') throw exercisesError;

        let totalWeight = 0;
        let weightUnit = userData.weight_unit || 'kg';

        if (exercisesData) {
          exercisesData.forEach(exercise => {
            if (exercise.weight && exercise.weight > 0 && exercise.weight_unit !== 'bodyweight') {
              // Convert to user's preferred weight unit if needed
              let weight = exercise.weight;
              if (exercise.weight_unit !== weightUnit) {
                weight = weightUnit === 'kg' ? weight * 0.453592 : weight * 2.20462;
              }
              totalWeight += weight * exercise.sets * exercise.reps;
            }
          });
        }

        // Fetch recent workouts with exercises
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', authUser.id)
          .order('date', { ascending: false })
          .limit(5);

        if (workoutsError) throw workoutsError;

        const formattedWorkouts: Workout[] = [];

        for (const workout of workoutsData || []) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);
            
          if (exercisesError) throw exercisesError;
          
          formattedWorkouts.push({
            id: workout.id,
            name: workout.name,
            date: workout.date,
            displayDate: format(new Date(workout.date), 'EEE, MMM d'),
            exercises: exercisesData.map(ex => ({
              id: ex.id,
              name: ex.name,
              muscleGroup: ex.muscle_group || '',
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || 0,
              weightUnit: ex.weight_unit
            })),
            notes: workout.notes,
            xpGained: workout.xp_gained
          });
        }

        // Get today's XP
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const { data: todayWorkouts, error: todayWorkoutsError } = await supabase
          .from('workouts')
          .select('xp_gained')
          .eq('user_id', authUser.id)
          .eq('date', todayDate);

        if (todayWorkoutsError) throw todayWorkoutsError;

        const todaysXP = todayWorkouts.reduce((sum, workout) => sum + (workout.xp_gained || 0), 0);

        // Update state with fetched data
        setUser({
          name: userData.display_name,
          displayName: userData.display_name,
          rank: currentRank,
          xp: totalXP,
          nextRankXp: nextRankXp,
          streak: streak,
          totalWorkouts: totalWorkouts || 0,
          joined: format(new Date(userData.joined_date), 'MMMM yyyy'),
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.display_name)}&background=6c5dd3&color=191a23&size=128`
        });

        setStats({
          workoutsThisWeek: currentWeekWorkouts?.length || 0,
          workoutsLastWeek: lastWeekWorkouts?.length || 0,
          weightLifted: `${Math.round(totalWeight / 1000)} ${weightUnit === 'kg' ? 'tons' : 'tons'}`,
          weightChange: {
            value: 0, // Would need body weight history to calculate this
            positive: true
          }
        });

        setRecentWorkouts(formattedWorkouts);
        setTodayXP(todaysXP);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Refresh data when workout is added
  const handleWorkoutAdded = () => {
    setShowWorkoutDialog(false);
    // Trigger refetch by running the useEffect again
    const fetchUserData = async () => {
      // Simplified version to just refetch recent workouts and today's XP
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // Fetch recent workouts with exercises
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', authUser.id)
          .order('date', { ascending: false })
          .limit(5);

        if (workoutsError) throw workoutsError;

        const formattedWorkouts: Workout[] = [];

        for (const workout of workoutsData || []) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);
            
          if (exercisesError) throw exercisesError;
          
          formattedWorkouts.push({
            id: workout.id,
            name: workout.name,
            date: workout.date,
            displayDate: format(new Date(workout.date), 'EEE, MMM d'),
            exercises: exercisesData.map(ex => ({
              id: ex.id,
              name: ex.name,
              muscleGroup: ex.muscle_group || '',
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || 0,
              weightUnit: ex.weight_unit
            })),
            notes: workout.notes,
            xpGained: workout.xp_gained
          });
        }

        // Get today's XP
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const { data: todayWorkouts, error: todayWorkoutsError } = await supabase
          .from('workouts')
          .select('xp_gained')
          .eq('user_id', authUser.id)
          .eq('date', todayDate);

        if (todayWorkoutsError) throw todayWorkoutsError;

        const todaysXP = todayWorkouts.reduce((sum, workout) => sum + (workout.xp_gained || 0), 0);

        setRecentWorkouts(formattedWorkouts);
        setTodayXP(todaysXP);

      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
      }
    };

    fetchUserData();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wolf-silver">Dashboard</h1>
        <p className="text-wolf-silver/60">Welcome back, {user.displayName}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wolf-purple"></div>
        </div>
      ) : (
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
                    alt={user.displayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3">{user.displayName}</h2>
                
                <RankBadge 
                  rank={user.rank}
                  xp={user.xp}
                  nextRankXp={user.nextRankXp}
                  iconSize="md"
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
                className="w-full h-14 bg-wolf-purple hover:bg-wolf-accent text-wolf-dark flex items-center justify-center text-lg overflow-x-auto whitespace-nowrap"
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
                  {recentWorkouts.length === 0 ? (
                    <div className="text-center py-8">
                      <Dumbbell className="h-12 w-12 mx-auto text-wolf-silver/30 mb-3" />
                      <p className="text-wolf-silver">No workouts logged yet</p>
                      <Button 
                        variant="ghost"
                        className="mt-2 text-wolf-purple hover:bg-wolf-purple/10"
                        onClick={() => setShowWorkoutDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Log your first workout
                      </Button>
                    </div>
                  ) : (
                    recentWorkouts.map((workout) => (
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
                            onClick={() => navigate(`/workouts?id=${workout.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick add workout dialog */}
      <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">Log Workout</DialogTitle>
          </DialogHeader>
          <WorkoutForm onComplete={handleWorkoutAdded} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
