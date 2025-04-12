
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

const formSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
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
  weightUnit: z.string(),
  date: z.date(),
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

const WorkoutForm = ({ onComplete }: WorkoutFormProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseName: "",
      sets: "",
      reps: "",
      weight: "",
      weightUnit: "kg",
      date: new Date(),
      notes: "",
    },
  });

  const handleExerciseChange = (value: string) => {
    if (value.length > 0) {
      const filtered = popularExercises.filter((exercise) =>
        exercise.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (exercise: string) => {
    form.setValue("exerciseName", exercise);
    setSuggestions([]);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // For now, we'll just log the data, but in a real app we'd save to Supabase
      console.log("Workout data:", {
        ...data,
        sets: parseInt(data.sets),
        reps: parseInt(data.reps),
        weight: data.weight ? parseFloat(data.weight) : 0,
      });
      
      toast.success("Workout logged successfully!", {
        description: `${data.exerciseName} - ${data.sets} sets of ${data.reps} reps`,
      });
      
      // Reset form
      form.reset({
        exerciseName: "",
        sets: "",
        reps: "",
        weight: "",
        weightUnit: "kg",
        date: new Date(),
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
        {/* Exercise Name with Autocomplete */}
        <div className="relative">
          <FormField
            control={form.control}
            name="exerciseName"
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
                      handleExerciseChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-wolf-charcoal border border-wolf-purple/20 shadow-lg">
              <ul className="max-h-60 overflow-auto py-1">
                {suggestions.map((exercise) => (
                  <li
                    key={exercise}
                    className="px-4 py-2 text-white hover:bg-wolf-purple/20 cursor-pointer"
                    onClick={() => selectSuggestion(exercise)}
                  >
                    {exercise}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sets, Reps and Weight */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sets"
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

          <FormField
            control={form.control}
            name="reps"
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
          <FormField
            control={form.control}
            name="weight"
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

          <FormField
            control={form.control}
            name="weightUnit"
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
