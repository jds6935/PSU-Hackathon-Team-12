
import { useState } from "react";
import { format, addMonths, subMonths, isToday, parseISO, isSameDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";

// Mock workout data
const mockWorkouts = [
  { id: "1", date: "2023-04-10", exercises: ["Bench Press", "Overhead Press", "Tricep Extensions"], xpGained: 100 },
  { id: "2", date: "2023-04-09", exercises: ["Deadlift", "Pull-ups", "Barbell Row"], xpGained: 75 },
  { id: "3", date: "2023-04-07", exercises: ["Squat", "Lunges"], xpGained: 75 },
  { id: "4", date: "2023-04-06", exercises: ["Bench Press", "Push-ups", "Bicep Curls"], xpGained: 75 },
  { id: "5", date: "2023-04-05", exercises: ["Deadlift", "Pull-ups"], xpGained: 25 },
  { id: "6", date: "2023-04-02", exercises: ["Squat", "Lunges", "Leg Press"], xpGained: 75 },
  { id: "7", date: "2023-04-01", exercises: ["Bench Press", "Incline Press", "Dips"], xpGained: 75 },
  { id: "8", date: "2023-03-29", exercises: ["Deadlift", "Pull-ups", "Face Pulls"], xpGained: 75 },
  { id: "9", date: "2023-03-27", exercises: ["Push-ups", "Dips", "Tricep Extensions"], xpGained: 50 }
];

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Check if a date has a workout
  const hasWorkout = (date: Date) => {
    return mockWorkouts.some(workout => isSameDay(parseISO(workout.date), date));
  };

  // Get workout details for a date
  const getWorkoutForDate = (date: Date) => {
    return mockWorkouts.find(workout => isSameDay(parseISO(workout.date), date));
  };

  const handleDateClick = (date: Date) => {
    const workout = getWorkoutForDate(date);
    if (workout) {
      setSelectedWorkout(workout);
      setIsDialogOpen(true);
    }
  };

  // Custom day rendering for the calendar
  const renderDay = (day: Date) => {
    const workout = getWorkoutForDate(day);
    const isWorkoutDay = !!workout;
    
    return (
      <div 
        className={`h-full w-full flex flex-col items-center justify-center p-1 relative
          ${isToday(day) ? 'bg-wolf-purple/20 rounded-md' : ''}
          ${isWorkoutDay ? 'cursor-pointer hover:bg-wolf-purple/10 rounded-md' : ''}
        `}
        onClick={isWorkoutDay ? () => handleDateClick(day) : undefined}
      >
        <span className={`${isToday(day) ? 'text-wolf-purple font-bold' : ''}`}>
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

      <div className="glass-card p-6 border-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver hover:text-wolf-purple"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(new Date())}
              className="h-8 w-8 bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver hover:text-wolf-purple"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver hover:text-wolf-purple"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CalendarComponent
          mode="single"
          month={currentMonth}
          selected={new Date()}
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

      <div className="mt-6 glass-card p-6 border-none">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Workout Days</div>
            <div className="text-2xl font-bold text-white mt-1">
              {mockWorkouts.length}
            </div>
          </div>
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Total XP Earned</div>
            <div className="text-2xl font-bold text-white mt-1">
              {mockWorkouts.reduce((total, workout) => total + workout.xpGained, 0)} XP
            </div>
          </div>
          <div className="bg-wolf-charcoal p-4 rounded-lg">
            <div className="text-wolf-silver text-sm">Consistency Rate</div>
            <div className="text-2xl font-bold text-white mt-1">
              {Math.floor((mockWorkouts.length / 30) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Workout details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">
              Workout on {selectedWorkout && format(parseISO(selectedWorkout.date), 'MMMM d, yyyy')}
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
                    {selectedWorkout.exercises.map((exercise: string, index: number) => (
                      <div key={index} className="p-3 bg-wolf-charcoal rounded-md">
                        <div className="text-white font-medium">{exercise}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-wolf-silver hover:text-wolf-purple">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Calendar;
