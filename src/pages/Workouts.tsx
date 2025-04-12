import { useState } from "react";
import { 
  Dumbbell, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  CalendarDays,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import WorkoutForm from "@/components/WorkoutForm";
import { Exercise, Workout } from "@/types/workout";

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

const Workouts = () => {
  const [tab, setTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Replace mock data with empty or external data source
  const exercises: Exercise[] = []; // #TODO: Fetch exercises from Supabase
  const workoutHistory: Workout[] = []; // #TODO: Fetch workout history from Supabase
  const [groupedWorkouts, setGroupedWorkouts] = useState(() => groupWorkoutsByMonth(workoutHistory));
  
  // Filter exercises based on search
  const filteredExercises = exercises.filter((exercise) => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteWorkout = (workoutId: string) => {
    // #TODO: Delete workout from Supabase
    toast.success("Workout deleted successfully");
    // Then update the state
    const updatedWorkoutHistory = workoutHistory.filter(w => w.id !== workoutId);
    setGroupedWorkouts(groupWorkoutsByMonth(updatedWorkoutHistory));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wolf-silver">Workouts</h1>
          <p className="text-wolf-silver/60">Track and log your fitness progress</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
          >
            <Plus className="mr-2 h-5 w-5" /> Log Workout
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6 bg-wolf-charcoal">
          <TabsTrigger value="history" className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver">
            <CalendarDays className="mr-2 h-4 w-4" /> Workout History
          </TabsTrigger>
          <TabsTrigger value="exercises" className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver">
            <Dumbbell className="mr-2 h-4 w-4" /> Exercise Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-6">
          {Object.entries(groupedWorkouts).length === 0 ? (
            <Alert className="glass-card border-wolf-purple/20">
              <Dumbbell className="h-5 w-5 text-wolf-purple" />
              <AlertTitle className="text-white">No workouts yet</AlertTitle>
              <AlertDescription className="text-wolf-silver">
                Click the "Log Workout" button to add your first workout and start earning XP!
              </AlertDescription>
            </Alert>
          ) : (
            Object.entries(groupedWorkouts).map(([month, workouts]) => (
              <div key={month} className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-wolf-purple/20 pb-2">{month}</h2>
                {workouts.map((workout) => (
                  <div key={workout.id} className="glass-card p-5 border-none">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{workout.name} • {workout.displayDate}</h3>
                        <p className="text-wolf-silver text-sm">{workout.exercises.length} exercises • +{workout.xpGained} XP</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-wolf-silver hover:text-wolf-purple">
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-wolf-purple/20" />
                          <DropdownMenuItem className="hover:text-wolf-purple hover:bg-wolf-dark cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Workout
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:text-red-500 hover:bg-wolf-dark cursor-pointer"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Workout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center bg-wolf-charcoal/50 p-3 rounded-lg">
                          <div className="p-2 bg-wolf-purple/10 rounded-md mr-4">
                            <Dumbbell className="h-4 w-4 text-wolf-purple" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{exercise.name}</h4>
                            <p className="text-sm text-wolf-silver">
                              {exercise.sets} sets × {exercise.reps} reps • {exercise.weight}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {workout.notes && (
                      <div className="mt-4 text-wolf-silver text-sm italic p-3 bg-wolf-charcoal/30 rounded-lg">
                        "{workout.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="exercises">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wolf-silver" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-wolf-charcoal border-wolf-purple/20 text-white pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.length === 0 ? (
              <div className="col-span-2 text-center py-10">
                <p className="text-wolf-silver">No exercises found matching your search</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="glass-card p-4 border-none flex items-center justify-between hover:bg-wolf-purple/5 cursor-pointer transition-colors"
                  onClick={() => {
                    setShowAddDialog(true);
                  }}
                >
                  <div className="flex items-center">
                    <div className="p-2 mr-3 bg-wolf-purple/10 rounded-md">
                      <Dumbbell className="h-5 w-5 text-wolf-purple" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{exercise.name}</h3>
                      <p className="text-sm text-wolf-silver">{exercise.muscleGroup}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-wolf-purple">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add workout dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">Log Workout</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-1">
              <WorkoutForm onComplete={() => setShowAddDialog(false)} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Workouts;
