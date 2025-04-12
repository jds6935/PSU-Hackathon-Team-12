import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Plus, X, ChevronDown, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Exercise } from "@/types/workout";

// Updating the form schema to support multi-exercise workouts
const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Exercise name is required"),
  sets: z.string().min(1, "Sets are required").refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 99,
    "Sets must be between 1 and 99"
  ),
  reps: z.string().min(1, "Reps are required").refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 999,
    "Reps must be between 1 and 999"
  ),
  weight: z.string().refine(
    (val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
    "Weight must be a positive number"
  ).optional(),
  weightUnit: z.string().default("kg"),
});

const formSchema = z.object({
  workoutName: z.string().min(1, "Workout name is required"),
  date: z.date(),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkoutFormProps {
  onComplete?: () => void;
}

const popularExercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Pull-ups",
  "Push-ups",
  "Overhead Press",
  "Barbell Row",
  "Lunges",
  "Bicep Curls",
  "Tricep Extensions",
];

const workoutTemplates = [
  { 
    name: "Chest Day", 
    exercises: [
      { name: "Bench Press", sets: "4", reps: "8", weight: "80", weightUnit: "kg" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "10", weight: "24", weightUnit: "kg" },
      { name: "Chest Flys", sets: "3", reps: "12", weight: "15", weightUnit: "kg" },
      { name: "Push-ups", sets: "3", reps: "15", weight: "", weightUnit: "bodyweight" },
    ]
  },
  { 
    name: "Back Day", 
    exercises: [
      { name: "Deadlift", sets: "5", reps: "5", weight: "120", weightUnit: "kg" },
      { name: "Pull-ups", sets: "4", reps: "8", weight: "", weightUnit: "bodyweight" },
      { name: "Barbell Row", sets: "3", reps: "10", weight: "70", weightUnit: "kg" },
    ]
  },
  { 
    name: "Leg Day", 
    exercises: [
      { name: "Squat", sets: "4", reps: "8", weight: "100", weightUnit: "kg" },
      { name: "Lunges", sets: "3", reps: "10", weight: "40", weightUnit: "kg" },
      { name: "Leg Press", sets: "3", reps: "12", weight: "150", weightUnit: "kg" },
      { name: "Calf Raises", sets: "4", reps: "15", weight: "60", weightUnit: "kg" },
    ]
  },
];

const WorkoutForm = ({ onComplete }: WorkoutFormProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workoutName: "",
      date: new Date(),
      exercises: [
        { name: "", sets: "", reps: "", weight: "", weightUnit: "kg" }
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const handleExerciseChange = (value: string, index: number) => {
    if (value.length > 0) {
      const filtered = popularExercises.filter((exercise) =>
        exercise.toLowerCase().includes(value.toLowerCase())
      );
      // Store suggestions with their index
      setSuggestions(filtered.slice(0, 5).map(ex => `${index}:${ex}`));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    const [indexStr, exercise] = suggestion.split(':');
    const index = parseInt(indexStr);
    if (!isNaN(index) && index >= 0 && index < fields.length) {
      form.setValue(`exercises.${index}.name`, exercise);
    }
    setSuggestions([]);
  };

  const applyTemplate = (template: typeof workoutTemplates[0]) => {
    form.setValue("workoutName", template.name);
    form.setValue("exercises", template.exercises);
  };

  const addExercise = () => {
    append({ name: "", sets: "", reps: "", weight: "", weightUnit: "kg" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You need to be logged in to log a workout");
        return;
      }
      
      // Format the exercises data
      const formattedExercises = data.exercises.map(ex => ({
        name: ex.name,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps),
        weight: ex.weight && ex.weight !== "" ? parseFloat(ex.weight) : 0,
        weight_unit: ex.weightUnit,
        muscle_group: "" // We don't collect this in the form currently
      }));
      
      // Calculate XP gained (basic algorithm - 10 XP per exercise)
      const xpGained = formattedExercises.length * 10;
      
      // Insert the workout first
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert([
          {
            user_id: user.id,
            name: data.workoutName,
            date: format(data.date, 'yyyy-MM-dd'),
            notes: data.notes || null,
            xp_gained: xpGained
          }
        ])
        .select();
      
      if (workoutError) throw workoutError;
      
      // Get the inserted workout ID
      const workoutId = workoutData[0].id;
      
      // Insert the exercises linked to this workout
      const exercisesWithWorkoutId = formattedExercises.map(exercise => ({
        ...exercise,
        workout_id: workoutId
      }));
      
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithWorkoutId);
      
      if (exercisesError) throw exercisesError;
      
      toast.success("Workout logged successfully!", {
        description: `${data.workoutName} with ${data.exercises.length} exercises`,
      });
      
      // Reset form
      form.reset({
        workoutName: "",
        date: new Date(),
        exercises: [{ name: "", sets: "", reps: "", weight: "", weightUnit: "kg" }],
        notes: "",
      });
      
      // Call completion handler if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast.error("Failed to log workout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Workout Templates */}
        <div className="mb-4">
          <FormLabel className="text-wolf-silver mb-2 block">Quick Templates</FormLabel>
          <div className="flex flex-wrap gap-2">
            {workoutTemplates.map((template, i) => (
              <Button 
                key={i} 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => applyTemplate(template)}
                className="bg-wolf-charcoal/60 border-wolf-purple/20 text-wolf-silver hover:bg-wolf-purple/10 hover:text-white"
              >
                <Dumbbell className="mr-1 h-3 w-3" /> {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Workout Name */}
        <FormField
          control={form.control}
          name="workoutName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-wolf-silver">Workout Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Chest Day, Leg Day"
                  className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Date Selector */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-wolf-silver">Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-wolf-charcoal border-wolf-purple/20",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-wolf-charcoal border-wolf-purple/20" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FormLabel className="text-wolf-silver">Exercises</FormLabel>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={addExercise}
              className="text-wolf-purple hover:bg-wolf-purple/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Exercise
            </Button>
          </div>
          
          <div className="space-y-4 relative">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-wolf-charcoal/40 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-white">Exercise {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Exercise Name with Autocomplete */}
                <div className="space-y-4">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-wolf-silver">Exercise Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Bench Press"
                              className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleExerciseChange(e.target.value, index);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    {suggestions.some(s => s.startsWith(`${index}:`)) && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-wolf-charcoal border border-wolf-purple/20 shadow-lg">
                        <ul className="max-h-60 overflow-auto py-1">
                          {suggestions.map((suggestion) => {
                            const [suggIndex, exercise] = suggestion.split(':');
                            if (parseInt(suggIndex) === index) {
                              return (
                                <li
                                  key={suggestion}
                                  className="px-4 py-2 text-white hover:bg-wolf-purple/20 cursor-pointer"
                                  onClick={() => selectSuggestion(suggestion)}
                                >
                                  {exercise}
                                </li>
                              );
                            }
                            return null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sets */}
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.sets`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-wolf-silver">Sets</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3"
                              min={1}
                              max={99}
                              className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    {/* Reps */}
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.reps`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-wolf-silver">Reps</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              min={1}
                              max={999}
                              className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Weight */}
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-wolf-silver">Weight (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              min={0}
                              step="0.5"
                              className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    {/* Weight Unit */}
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.weightUnit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-wolf-silver">Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lbs">lbs</SelectItem>
                              <SelectItem value="bodyweight">Bodyweight</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-wolf-silver">Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details about this workout..."
                  className="resize-none bg-wolf-charcoal border-wolf-purple/20 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
        >
          {loading ? "Logging..." : "Log Workout"}
        </Button>
      </form>
    </Form>
  );
};

export default WorkoutForm;
