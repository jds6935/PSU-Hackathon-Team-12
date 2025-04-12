import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Trophy,
  Dumbbell,
  Medal,
  Award,
  Calendar,
  Save,
  Check,
  Loader2,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

import RankBadge from "@/components/RankBadge";

// Form schema
const profileFormSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  fitnessGoal: z.string(),
  weightUnit: z.string(),
});

type FormValues = z.infer<typeof profileFormSchema>;

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress: number;
  dateEarned?: string;
}

interface RankProgression {
  id: string;
  rank: string;
  minXp: number;
  maxXp: number | null;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    bio: "",
    fitnessGoal: "overall",
    weightUnit: "kg",
    avatar: "https://ui-avatars.com/api/?name=User&background=6c5dd3&color=191a23&size=128",
    stats: {
      joinedDate: "",
      totalWorkouts: 0,
      xp: 0,
      nextRankXp: 100,
      rank: "Novice",
      highestStreak: 0,
      currentStreak: 0,
      totalWeightLifted: "0 kg",
    },
    achievements: [] as Achievement[],
  });

  const [rankProgressions, setRankProgressions] = useState<RankProgression[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Not authenticated");
          return;
        }

        // Fetch user profile data
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Fetch user's total workouts count
        const { count: totalWorkouts, error: countError } = await supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;

        // Fetch user's total XP
        const { data: xpData, error: xpError } = await supabase
          .from('workouts')
          .select('xp_gained')
          .eq('user_id', user.id);

        if (xpError) throw xpError;

        const totalXP = xpData.reduce((sum, workout) => sum + (workout.xp_gained || 0), 0);

        // Fetch rank progression data
        const { data: ranksData, error: ranksError } = await supabase
          .from('rank_progressions')
          .select('*')
          .order('min_xp', { ascending: true });

        if (ranksError) throw ranksError;

        // Format rank progressions
        const formattedRanks = ranksData.map(rank => ({
          id: rank.id,
          rank: rank.rank,
          minXp: rank.min_xp,
          maxXp: rank.max_xp
        }));

        setRankProgressions(formattedRanks);

        // Determine current rank and next rank XP
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

        // Fetch achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);

        if (achievementsError) throw achievementsError;

        // Format achievements
        const formattedAchievements = achievementsData.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description || '',
          earned: achievement.earned,
          progress: achievement.progress,
          dateEarned: achievement.date_earned ? format(new Date(achievement.date_earned), 'MMMM d, yyyy') : undefined
        }));

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
          .eq('workouts.user_id', user.id);

        if (exercisesError && exercisesError.code !== 'PGRST116') throw exercisesError;

        let totalWeight = 0;
        let weightUnit = userProfile.weight_unit || 'kg';

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

        // Calculate streak
        const { data: streakData, error: streakError } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (streakError) throw streakError;

        let currentStreak = 0;
        let highestStreak = 0;

        if (streakData && streakData.length > 0) {
          const dates = streakData.map(w => format(new Date(w.date), 'yyyy-MM-dd')).sort().reverse();
          const uniqueDates = Array.from(new Set(dates));
          
          // Calculate current streak
          let streak = 0;
          const today = format(new Date(), 'yyyy-MM-dd');
          const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
          
          if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
            streak = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
              const date1 = new Date(uniqueDates[i-1]);
              const date2 = new Date(uniqueDates[i]);
              const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)));
              
              if (diffDays === 1) {
                streak++;
              } else {
                break;
              }
            }
          }
          
          // Calculate highest streak
          let tempStreak = 1;
          let maxStreak = 1;
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const date1 = new Date(uniqueDates[i-1]);
            const date2 = new Date(uniqueDates[i]);
            const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)));
            
            if (diffDays === 1) {
              tempStreak++;
              maxStreak = Math.max(maxStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
          
          currentStreak = streak;
          highestStreak = maxStreak;
        }

        // Update state with all fetched data
        setUserData({
          displayName: userProfile.display_name,
          email: userProfile.email,
          bio: userProfile.bio || "",
          fitnessGoal: userProfile.fitness_goal || "overall",
          weightUnit: userProfile.weight_unit || "kg",
          avatar: userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.display_name)}&background=6c5dd3&color=191a23&size=128`,
          stats: {
            joinedDate: format(new Date(userProfile.joined_date), 'MMMM yyyy'),
            totalWorkouts: totalWorkouts || 0,
            xp: totalXP,
            nextRankXp: nextRankXp,
            rank: currentRank,
            highestStreak: highestStreak,
            currentStreak: currentStreak,
            totalWeightLifted: `${(totalWeight / 1000).toFixed(1)} ${weightUnit === 'kg' ? 'tons' : 'tons'}`,
          },
          achievements: formattedAchievements,
        });

        // Initialize form with user data
        form.reset({
          displayName: userProfile.display_name,
          email: userProfile.email,
          bio: userProfile.bio || "",
          fitnessGoal: userProfile.fitness_goal || "overall",
          weightUnit: userProfile.weight_unit || "kg",
        });

      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userData.displayName,
      email: userData.email,
      bio: userData.bio,
      fitnessGoal: userData.fitnessGoal,
      weightUnit: userData.weightUnit,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }
      
      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          bio: data.bio,
          fitness_goal: data.fitnessGoal,
          weight_unit: data.weightUnit,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      
      // Update local state
      setUserData({
        ...userData,
        displayName: data.displayName,
        bio: data.bio || "",
        fitnessGoal: data.fitnessGoal,
        weightUnit: data.weightUnit,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wolf-silver">Profile</h1>
        <p className="text-wolf-silver/60">Manage your account and view progress</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wolf-purple"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-wolf-charcoal">
            <TabsTrigger value="overview" className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver">
              <User className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver">
              <Trophy className="mr-2 h-4 w-4" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="progression" className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver">
              <Award className="mr-2 h-4 w-4" /> Progression
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Profile details card */}
              <Card className="col-span-1 md:col-span-4 glass-card border-none shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-white">Profile Details</CardTitle>
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                        className="text-wolf-purple hover:text-wolf-accent hover:bg-wolf-charcoal/50"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <CardDescription className="text-wolf-silver">
                    Member since {userData.stats.joinedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-wolf-purple mb-4">
                      <img 
                        src={userData.avatar} 
                        alt={userData.displayName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <RankBadge 
                      rank={userData.stats.rank}
                      xp={userData.stats.xp}
                      nextRankXp={userData.stats.nextRankXp}
                    />
                  </div>
                  
                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-wolf-silver">Display Name</FormLabel>
                              <FormControl>
                                <Input
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-wolf-silver">Email</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-wolf-charcoal border-wolf-purple/20 text-white"
                                  disabled
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-wolf-silver">Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-none bg-wolf-charcoal border-wolf-purple/20 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fitnessGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-wolf-silver">Fitness Goal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                                    <SelectValue placeholder="Select a goal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                                  <SelectItem value="strength">Strength</SelectItem>
                                  <SelectItem value="muscle">Muscle Building</SelectItem>
                                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                                  <SelectItem value="endurance">Endurance</SelectItem>
                                  <SelectItem value="overall">Overall Fitness</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="weightUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-wolf-silver">Preferred Weight Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-wolf-charcoal border-wolf-purple/20 text-white">
                                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setIsEditing(false)}
                            className="text-wolf-silver"
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isSaving}
                            className="bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm text-wolf-silver font-medium mb-1">Display Name</h3>
                        <p className="text-white">{userData.displayName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm text-wolf-silver font-medium mb-1">Email</h3>
                        <p className="text-white">{userData.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm text-wolf-silver font-medium mb-1">Bio</h3>
                        <p className="text-white">{userData.bio || "-"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm text-wolf-silver font-medium mb-1">Fitness Goal</h3>
                        <p className="text-white capitalize">{userData.fitnessGoal.replace("-", " ")}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm text-wolf-silver font-medium mb-1">Preferred Weight Unit</h3>
                        <p className="text-white">{userData.weightUnit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats grid */}
              <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="glass-card border-none shadow-md">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">Streak</CardTitle>
                      <CardDescription className="text-wolf-silver">Consistent training</CardDescription>
                    </div>
                    <Flame className="h-5 w-5 text-wolf-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{userData.stats.currentStreak}</p>
                        <p className="text-sm text-wolf-silver">Current</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{userData.stats.highestStreak}</p>
                        <p className="text-sm text-wolf-silver">Highest</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-none shadow-md">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">Workouts</CardTitle>
                      <CardDescription className="text-wolf-silver">Total sessions</CardDescription>
                    </div>
                    <Dumbbell className="h-5 w-5 text-wolf-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{userData.stats.totalWorkouts}</p>
                      <p className="text-sm text-wolf-silver">Completed</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-none shadow-md">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">Weight Lifted</CardTitle>
                      <CardDescription className="text-wolf-silver">Cumulative</CardDescription>
                    </div>
                    <Trophy className="h-5 w-5 text-wolf-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{userData.stats.totalWeightLifted}</p>
                      <p className="text-sm text-wolf-silver">Total</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-none shadow-md">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">Achievements</CardTitle>
                      <CardDescription className="text-wolf-silver">Milestones</CardDescription>
                    </div>
                    <Medal className="h-5 w-5 text-wolf-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {userData.achievements.filter(a => a.earned).length}/{userData.achievements.length}
                      </p>
                      <p className="text-sm text-wolf-silver">Unlocked</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <Card className="glass-card border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Your Achievements</CardTitle>
                <CardDescription className="text-wolf-silver">Progress milestones and badges</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-wolf-silver/30 mb-3" />
                    <p className="text-wolf-silver">No achievements available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userData.achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-lg ${achievement.earned ? 'bg-wolf-purple/10' : 'bg-wolf-charcoal/40'}`}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full ${achievement.earned ? 'bg-wolf-purple/20' : 'bg-wolf-charcoal/60'} mr-4`}>
                            {achievement.earned ? (
                              <Trophy className="h-6 w-6 text-wolf-purple" />
                            ) : (
                              <Medal className="h-6 w-6 text-wolf-silver/60" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="font-bold text-white">{achievement.name}</h3>
                              {achievement.earned && (
                                <span className="ml-2 text-xs bg-wolf-purple/20 text-wolf-purple py-0.5 px-2 rounded-full">
                                  Earned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-wolf-silver mb-3">{achievement.description}</p>
                            
                            {achievement.earned && achievement.dateEarned ? (
                              <p className="text-xs text-wolf-purple">Earned on {achievement.dateEarned}</p>
                            ) : (
                              <div>
                                <div className="flex justify-between text-xs text-wolf-silver mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress 
                                  value={achievement.progress} 
                                  className="h-1.5 bg-wolf-dark" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progression" className="space-y-6">
            <Card className="glass-card border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Rank Progression</CardTitle>
                <CardDescription className="text-wolf-silver">Your journey through the pack hierarchy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">Current Rank: <span className="text-wolf-purple">{userData.stats.rank}</span></h3>
                      <p className="text-sm text-wolf-silver">
                        {userData.stats.xp} XP / {userData.stats.nextRankXp} XP needed for next rank
                      </p>
                    </div>
                    <RankBadge
                      rank={userData.stats.rank}
                      xp={userData.stats.xp}
                      nextRankXp={userData.stats.nextRankXp}
                    />
                  </div>
                  <Progress 
                    value={(userData.stats.xp / userData.stats.nextRankXp) * 100} 
                    className="h-2.5 bg-wolf-charcoal" 
                  />
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-wolf-purple/20 pb-2">Rank Tiers</h3>
                  
                  <div className="space-y-4">
                    {rankProgressions.map((rankTier, index) => {
                      const isCurrentRank = rankTier.rank === userData.stats.rank;
                      const isLocked = userData.stats.xp < rankTier.minXp;
                      const progress = isLocked 
                        ? 0 
                        : isCurrentRank 
                          ? ((userData.stats.xp - rankTier.minXp) / (userData.stats.nextRankXp - rankTier.minXp)) * 100 
                          : 100;
                      
                      return (
                        <div 
                          key={rankTier.id} 
                          className={`p-4 rounded-lg ${
                            isCurrentRank ? 'bg-wolf-purple/10 border border-wolf-purple/30' : 
                            isLocked ? 'bg-wolf-charcoal/40 opacity-70' : 'bg-wolf-charcoal/60'
                          }`}
                        >
                          <div className="flex items-center mb-3">
                            <div className={`p-2 rounded-full ${
                              isLocked ? 'bg-wolf-charcoal/60' : 'bg-wolf-purple/20'
                            } mr-4`}>
                              {isLocked ? (
                                <Award className="h-6 w-6 text-wolf-silver/60" />
                              ) : (
                                <Trophy className="h-6 w-6 text-wolf-purple" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-white">{rankTier.rank}</h3>
                                {isCurrentRank && (
                                  <span className="text-xs bg-wolf-purple/20 text-wolf-purple py-0.5 px-2 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-wolf-silver">
                                {rankTier.minXp} XP required
                                {index < rankProgressions.length - 1 && ` (${rankProgressions[index + 1].minXp - rankTier.minXp} XP to next rank)`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-wolf-silver mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress 
                              value={progress} 
                              className="h-2 bg-wolf-dark" 
                              style={{
                                "--progress-fill": isLocked ? "var(--wolf-silver-30)" : "var(--wolf-purple)"
                              } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
};

export default Profile;
