import { useState, useEffect } from "react";
import { format, isToday, parseISO, isSameDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell } from "lucide-react";
import { Workout } from "@/types/workout";
import supabase from "@/lib/supabaseClient";

// Helper function to group workouts by month
const groupWorkoutsByMonth = (workouts: Workout[]) => {
  return workouts.reduce((groups: Record<string, Workout[]>, workout) => {
    const date = new Date(workout.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(workout);
    return groups;
  }, {});
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupedWorkouts, setGroupedWorkouts] = useState<Record<string, Workout[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [monthStats, setMonthStats] = useState({
    workoutDays: 0,
    totalXP: 0,
    consistencyRate: 0
  });

  // Fetch workouts from Supabase
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch workouts for this user
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (workoutsError) throw workoutsError;

        // Format workouts and add exercises
        const formattedWorkouts: Workout[] = [];
        const workoutDateObjects: Date[] = [];
        
        for (const workout of workoutsData || []) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);
            
          if (exercisesError) throw exercisesError;
          
          const workoutDate = new Date(workout.date);
          workoutDateObjects.push(workoutDate);
          
          formattedWorkouts.push({
            id: workout.id,
            name: workout.name,
            date: workout.date,
            displayDate: format(workoutDate, 'EEEE, MMMM d, yyyy'),
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

        // Group workouts by month
        const grouped = groupWorkoutsByMonth(formattedWorkouts);
        setGroupedWorkouts(grouped);
        setWorkoutDates(workoutDateObjects);
        
        // Calculate month stats
        calculateMonthStats(formattedWorkouts, currentMonth);
        
        // Check if today has a workout
        if (selectedDate) {
          const todayWorkout = formattedWorkouts.find(w => 
            isSameDay(new Date(w.date), selectedDate)
          );
          setSelectedWorkout(todayWorkout || null);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedDate, currentMonth]);

  // Calculate stats for the current month
  const calculateMonthStats = (workouts: Workout[], month: Date) => {
    const currentMonthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const currentMonthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const today = new Date();
    
    // Filter workouts for current month
    const monthWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= currentMonthStart && workoutDate <= currentMonthEnd;
    });
    
    // Calculate days since start of month (up to today)
    const endDate = today < currentMonthEnd ? today : currentMonthEnd;
    const daysSinceMonthStart = Math.floor((endDate.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate workout days (unique dates)
    const uniqueDates = new Set(monthWorkouts.map(w => format(new Date(w.date), 'yyyy-MM-dd')));
    const workoutDays = uniqueDates.size;
    
    // Calculate total XP earned
    const totalXP = monthWorkouts.reduce((sum, workout) => sum + workout.xpGained, 0);
    
    // Calculate consistency rate based on days since month start
    const consistencyRate = Math.round((workoutDays / daysSinceMonthStart) * 100);
    
    setMonthStats({
      workoutDays,
      totalXP,
      consistencyRate
    });
  };

  // Check if a date has a workout
  const hasWorkout = (date: Date) => {
    return workoutDates.some(workoutDate => isSameDay(workoutDate, date));
  };

  // Get workout details for a date
  const getWorkoutForDate = (date: Date) => {
    for (const monthKey in groupedWorkouts) {
      const monthWorkouts = groupedWorkouts[monthKey];
      const workout = monthWorkouts.find(w => isSameDay(new Date(w.date), date));
      if (workout) return workout;
    }
    return null;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const workout = getWorkoutForDate(date);
    if (workout) {
      setSelectedWorkout(workout);
    } else {
      setSelectedWorkout(null);
    }
  };

  // Custom day rendering for the calendar
  const renderDay = (day: Date) => {
    const isWorkoutDay = hasWorkout(day);
    const isSelected = selectedDate ? isSameDay(selectedDate, day) : false;
    
    return (
      <div 
        className={`h-full w-full flex flex-col items-center justify-center p-1 relative
          ${isToday(day) ? 'bg-wolf-purple/20 rounded-md' : ''}
          ${isSelected ? 'bg-wolf-purple/40 rounded-md' : ''}
          ${isWorkoutDay ? 'cursor-pointer hover:bg-wolf-purple/10 rounded-md' : 'cursor-pointer hover:bg-wolf-charcoal/30 rounded-md'}
        `}
        onClick={() => handleDateClick(day)}
      >
        <span className={`${isToday(day) ? 'text-wolf-purple font-bold' : isSelected ? 'text-white font-bold' : ''}`}>
          {format(day, 'd')}
        </span>
        
        {isWorkoutDay && (
          <div className="mt-1 flex space-x-1">
            <span className="h-1.5 w-1.5 bg-wolf-purple rounded-full"></span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wolf-silver">Workout Calendar</h1>
        <p className="text-wolf-silver/60">Track your training consistency</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wolf-purple"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass-card p-6 border-none">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(new Date());
                    }}
                    className="bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver hover:text-wolf-purple"
                  >
                    Today
                  </Button>
                </div>
              </div>

              <CalendarComponent
                mode="single"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                selected={selectedDate}
                onSelect={handleDateClick}
                className="bg-transparent"
                classNames={{
                  day_today: "bg-transparent",
                  day_selected: "bg-transparent text-white",
                  day_range_middle: "bg-transparent",
                  day_outside: "text-wolf-silver/30 bg-transparent"
                }}
                components={{
                  Day: ({ date }) => renderDay(date)
                }}
              />

              <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 bg-wolf-purple rounded-full mr-2"></div>
                  <span className="text-wolf-silver">Workout day</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 border border-white/20 bg-transparent rounded-full mr-2"></div>
                  <span className="text-wolf-silver">No workout</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="glass-card p-6 border-none h-full">
              <h2 className="text-xl font-bold text-white mb-4">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              
              {selectedWorkout ? (
                <div className="space-y-4">
                  <div className="bg-wolf-charcoal/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Dumbbell className="h-5 w-5 text-wolf-purple mr-2" />
                        <h3 className="font-bold text-lg text-white">{selectedWorkout.name}</h3>
                      </div>
                      <div className="text-wolf-purple font-medium">+{selectedWorkout.xpGained} XP</div>
                    </div>
                    
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-2">
                        {selectedWorkout.exercises.map((exercise) => (
                          <div key={exercise.id} className="p-3 bg-wolf-charcoal rounded-md">
                            <div className="text-white font-medium">{exercise.name}</div>
                            <div className="text-sm text-wolf-silver">
                              {exercise.sets} sets × {exercise.reps} reps • {exercise.weight} {exercise.weightUnit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {selectedWorkout.notes && (
                    <div className="text-wolf-silver text-sm italic p-3 bg-wolf-charcoal/30 rounded-lg">
                      "{selectedWorkout.notes}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <Dumbbell className="h-12 w-12 text-wolf-silver/30 mb-4" />
                  <p className="text-wolf-silver/60">No workout recorded for this day</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver hover:text-wolf-purple"
                    onClick={() => window.location.href = '/workouts'}
                  >
                    Add Workout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 glass-card p-6 border-none">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Workout Days</div>
            <div className="text-2xl font-bold text-white mt-1">
              {monthStats.workoutDays}
            </div>
          </div>
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Total XP Earned</div>
            <div className="text-2xl font-bold text-white mt-1">
              {monthStats.totalXP} XP
            </div>
          </div>
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Consistency This Month</div>
            <div className="text-2xl font-bold text-white mt-1">
              {monthStats.consistencyRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Workout details dialog (for mobile) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">
              {selectedWorkout?.name} • {selectedWorkout && format(parseISO(selectedWorkout.date), 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4">
              <div className="bg-wolf-charcoal/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Dumbbell className="h-5 w-5 text-wolf-purple mr-2" />
                    <h3 className="font-bold text-lg text-white">Exercises</h3>
                  </div>
                  <div className="text-wolf-purple font-medium">+{selectedWorkout.xpGained} XP</div>
                </div>
                
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {selectedWorkout.exercises.map((exercise) => (
                      <div key={exercise.id} className="p-3 bg-wolf-charcoal rounded-md">
                        <div className="text-white font-medium">{exercise.name}</div>
                        <div className="text-sm text-wolf-silver">
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.weight} {exercise.weightUnit}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {selectedWorkout.notes && (
                <div className="text-wolf-silver text-sm italic p-3 bg-wolf-charcoal/30 rounded-lg">
                  "{selectedWorkout.notes}"
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Calendar;

