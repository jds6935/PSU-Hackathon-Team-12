
import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { toast } from "sonner";

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

// Mock user data
const userData = {
  displayName: "Alpha Hunter",
  email: "alpha@wolfpack.com",
  bio: "Fitness enthusiast, always pushing my limits.",
  fitnessGoal: "strength",
  weightUnit: "kg",
  avatar: "/public/lovable-uploads/09661d06-c457-416e-9cc4-69eca6a35989.png",
  stats: {
    joinedDate: "March 10, 2023",
    totalWorkouts: 27,
    xp: 380,
    nextRankXp: 450,
    rank: "Beta Wolf",
    highestStreak: 7,
    currentStreak: 4,
    totalWeightLifted: "12,540 kg",
  },
  achievements: [
    { id: "1", name: "First Blood", description: "Complete your first workout", earned: true, icon: Dumbbell, date: "March 10, 2023" },
    { id: "2", name: "Hat-trick", description: "Complete 3 workouts in 3 consecutive days", earned: true, icon: Calendar, date: "March 15, 2023" },
    { id: "3", name: "Week Warrior", description: "Complete 7 workouts in 7 consecutive days", earned: true, icon: Award, date: "March 25, 2023" },
    { id: "4", name: "Century Club", description: "Lift a total of 10,000 kg", earned: true, icon: Trophy, date: "April 2, 2023" },
    { id: "5", name: "Double Century", description: "Lift a total of 20,000 kg", earned: false, icon: Trophy, progress: 62 },
    { id: "6", name: "Month Master", description: "Complete 30 workouts in 30 consecutive days", earned: false, icon: Calendar, progress: 27 },
    { id: "7", name: "Alpha Status", description: "Reach Alpha Wolf rank", earned: false, icon: Medal, progress: 84 },
  ]
};

const rankProgressions = [
  { rank: "Runt of the Litter", minXp: 0, maxXp: 100, reached: true },
  { rank: "Little Pup", minXp: 101, maxXp: 250, reached: true },
  { rank: "Packling", minXp: 251, maxXp: 450, reached: true },
  { rank: "Howler", minXp: 451, maxXp: 700, reached: false },
  { rank: "Beta Wolf", minXp: 701, maxXp: 1000, reached: false },
  { rank: "Alpha Wolf", minXp: 1001, maxXp: 1500, reached: false },
  { rank: "Sigma Wolf", minXp: 1501, maxXp: 2500, reached: false },
  { rank: "Sigma Wolf Elite", minXp: 2501, maxXp: null, reached: false },
];

// Form schema
const profileFormSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  fitnessGoal: z.string(),
  weightUnit: z.string(),
});

type FormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);

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
      // Here we would update the user data in Supabase
      console.log("Updating profile:", data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
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
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving}
                          onClick={() => setIsEditing(false)}
                          className="bg-wolf-charcoal border-wolf-purple/20 text-wolf-silver"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-wolf-silver">Display Name</h3>
                      <p className="text-white">{userData.displayName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-wolf-silver">Email</h3>
                      <p className="text-white">{userData.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-wolf-silver">Bio</h3>
                      <p className="text-white">{userData.bio || "No bio set"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-wolf-silver">Fitness Goal</h3>
                      <p className="text-white capitalize">{userData.fitnessGoal}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-wolf-silver">Preferred Weight Unit</h3>
                      <p className="text-white uppercase">{userData.weightUnit}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats cards */}
            <div className="col-span-1 md:col-span-8 grid grid-cols-1 gap-6">
              <Card className="glass-card border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Stats Summary</CardTitle>
                  <CardDescription className="text-wolf-silver">
                    Your fitness journey in numbers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-wolf-charcoal rounded-lg">
                      <div className="text-wolf-silver text-sm">Total Workouts</div>
                      <div className="text-2xl font-bold text-white mt-1">{userData.stats.totalWorkouts}</div>
                    </div>
                    
                    <div className="p-4 bg-wolf-charcoal rounded-lg">
                      <div className="text-wolf-silver text-sm">Current Streak</div>
                      <div className="text-2xl font-bold text-white mt-1">{userData.stats.currentStreak} days</div>
                    </div>
                    
                    <div className="p-4 bg-wolf-charcoal rounded-lg">
                      <div className="text-wolf-silver text-sm">Highest Streak</div>
                      <div className="text-2xl font-bold text-white mt-1">{userData.stats.highestStreak} days</div>
                    </div>
                    
                    <div className="p-4 bg-wolf-charcoal rounded-lg">
                      <div className="text-wolf-silver text-sm">Total Weight Lifted</div>
                      <div className="text-2xl font-bold text-white mt-1">{userData.stats.totalWeightLifted}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Latest Achievements</CardTitle>
                  <CardDescription className="text-wolf-silver">
                    Recent milestones you've reached
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.achievements
                      .filter(achievement => achievement.earned)
                      .slice(0, 3)
                      .map(achievement => (
                        <div key={achievement.id} className="flex items-center p-3 bg-wolf-charcoal rounded-lg">
                          <div className="p-2 bg-wolf-purple/20 rounded-full mr-4">
                            <achievement.icon className="h-5 w-5 text-wolf-purple" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{achievement.name}</h4>
                            <p className="text-sm text-wolf-silver">{achievement.description}</p>
                          </div>
                          <div className="text-wolf-purple text-sm">{achievement.date}</div>
                        </div>
                      ))}
                      
                    <Button 
                      variant="ghost" 
                      className="w-full text-wolf-purple hover:bg-wolf-purple/10"
                      onClick={() => setActiveTab('achievements')}
                    >
                      View All Achievements
                    </Button>
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
              <CardDescription className="text-wolf-silver">
                Milestones and badges earned through your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg ${
                      achievement.earned 
                        ? 'glass-card border-wolf-purple/20' 
                        : 'bg-wolf-charcoal/50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-3 rounded-full ${
                        achievement.earned 
                          ? 'bg-wolf-purple/20 text-wolf-purple' 
                          : 'bg-wolf-charcoal text-wolf-silver'
                      } mr-4`}>
                        <achievement.icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-bold ${
                            achievement.earned ? 'text-white' : 'text-wolf-silver'
                          }`}>
                            {achievement.name}
                          </h3>
                          {achievement.earned && (
                            <span className="flex items-center text-green-400 text-xs">
                              <Check className="h-3 w-3 mr-1" /> Earned
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-wolf-silver">{achievement.description}</p>
                        
                        {achievement.earned ? (
                          <p className="text-xs text-wolf-silver mt-2">Earned on {achievement.date}</p>
                        ) : (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-wolf-silver mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1.5 bg-wolf-charcoal" indicatorClassName="bg-wolf-purple/50" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progression" className="space-y-6">
          <Card className="glass-card border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Rank Progression</CardTitle>
              <CardDescription className="text-wolf-silver">
                Climb the wolf pack hierarchy with your training efforts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8 p-4 bg-wolf-charcoal rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-white">Current Rank</h3>
                  <span className="text-wolf-silver">{userData.stats.xp} / {userData.stats.nextRankXp} XP</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-wolf-purple/10 rounded-lg flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-wolf-purple" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-xl font-bold">{userData.stats.rank}</h4>
                    <Progress 
                      value={(userData.stats.xp / userData.stats.nextRankXp) * 100} 
                      className="h-2 mt-2 bg-wolf-charcoal" 
                      indicatorClassName="bg-wolf-purple" 
                    />
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-4">Rank Ladder</h3>
              <div className="space-y-6">
                <ol className="relative border-l border-wolf-purple/30">
                  {rankProgressions.map((rank, index) => (
                    <li key={rank.rank} className="mb-6 ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                        rank.reached 
                          ? 'bg-wolf-purple text-wolf-dark' 
                          : 'bg-wolf-charcoal text-wolf-silver'
                      }`}>
                        {rank.reached ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <div className={`flex items-center ${rank.reached ? 'opacity-100' : 'opacity-60'}`}>
                        <h3 className={`font-bold mb-1 ${rank.reached ? 'text-white' : 'text-wolf-silver'}`}>
                          {rank.rank}
                        </h3>
                      </div>
                      <p className="text-sm text-wolf-silver mb-1">
                        {rank.minXp} - {rank.maxXp ? rank.maxXp : "∞"} XP
                      </p>
                      {userData.stats.rank === rank.rank && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-wolf-silver mb-1">
                            <span>Current Progress</span>
                            <span>{Math.round((userData.stats.xp - rank.minXp) / (rank.maxXp - rank.minXp) * 100)}%</span>
                          </div>
                          <Progress 
                            value={Math.round((userData.stats.xp - rank.minXp) / (rank.maxXp - rank.minXp) * 100)}
                            className="h-1.5 bg-wolf-charcoal"
                            indicatorClassName="bg-wolf-purple"
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Profile;
