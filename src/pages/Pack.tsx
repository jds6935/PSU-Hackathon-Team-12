import { useState, useEffect } from "react";
import { Users, Search, UserPlus, UserCheck, Mail, ChevronRight, Activity, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import supabase from "@/lib/supabaseClient";

import StreakCounter from "@/components/StreakCounter";
import RankBadge from "@/components/RankBadge";
import { CustomProgress } from "@/components/ui/custom-progress";
import { FriendProfile } from "@/types/workout";

// Define interface for friend request data structure
interface FriendRequestData {
  id: string;
  sender_id: string;
  request_date: string;
  users: {
    display_name: string;
    avatar: string | null;
  };
}

const Pack = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [suggestions, setSuggestions] = useState<{ 
    id: string; 
    name: string; 
    joinedDate: string; 
    mutualFriends: number; 
    avatar: string 
  }[]>([]);
  const [requests, setRequests] = useState<{ 
    id: string; 
    name: string; 
    requestDate: string; 
    avatar: string 
  }[]>([]);

  useEffect(() => {
    const fetchFriendData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You need to be logged in");
          return;
        }

        // Fetch friends (users with accepted friend requests)
        const { data: acceptedFriendRequests, error: friendsError } = await supabase
          .from('friend_requests')
          .select(`
            sender_id,
            receiver_id
          `)
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (friendsError) throw friendsError;

        // Extract friend IDs (excluding current user)
        const friendIds = acceptedFriendRequests?.map(req => 
          req.sender_id === user.id ? req.receiver_id : req.sender_id
        ) || [];

        // Fetch friend profiles
        const friendProfiles: FriendProfile[] = [];
        
        for (const friendId of friendIds) {
          // Get user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', friendId)
            .single();
            
          if (userError) continue;
          
          // Get user's total XP
          const { data: xpData } = await supabase
            .from('workouts')
            .select('xp_gained')
            .eq('user_id', friendId);
            
          const totalXP = xpData?.reduce((sum, workout) => sum + (workout.xp_gained || 0), 0) || 0;
          
          // Get user's current rank
          const { data: ranksData } = await supabase
            .from('rank_progressions')
            .select('*')
            .order('min_xp', { ascending: true });
            
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
          
          // Calculate streak
          const { data: streakData } = await supabase
            .from('workouts')
            .select('date')
            .eq('user_id', friendId)
            .order('date', { ascending: false });
            
          let streak = 0;
          
          if (streakData && streakData.length > 0) {
            const dates = streakData.map(w => w.date).sort().reverse();
            const uniqueDates = Array.from(new Set(dates));
            
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
          }
          
          // Get user's total workouts
          const { count: totalWorkouts } = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', friendId);
            
          friendProfiles.push({
            id: friendId,
            name: userData.display_name,
            rank: currentRank,
            xp: totalXP,
            nextRankXp: nextRankXp,
            streak: streak,
            totalWorkouts: totalWorkouts || 0,
            joined: format(new Date(userData.joined_date), 'MMMM yyyy'),
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.display_name)}&background=6c5dd3&color=191a23&size=128`,
            lastActive: "Recently", // Could calculate this based on last workout date
            status: Math.random() > 0.5 ? "online" : "offline" // Randomize for demo purposes
          });
        }
        
        setFriends(friendProfiles);
        
        // Fetch friend suggestions (users who are not friends yet)
        const { data: suggestionData, error: suggestionError } = await supabase
          .from('users')
          .select('id, display_name, joined_date, avatar')
          .neq('id', user.id)
          .limit(10);
          
        if (suggestionError) throw suggestionError;
        
        // Filter out existing friends and requests
        const suggestionsFiltered = suggestionData?.filter(suggestion => 
          !friendIds.includes(suggestion.id) &&
          !requests.some(req => req.id === suggestion.id)
        ) || [];
        
        // Format suggestions
        const formattedSuggestions = suggestionsFiltered.map(suggestion => ({
          id: suggestion.id,
          name: suggestion.display_name,
          joinedDate: format(new Date(suggestion.joined_date), 'MMM yyyy'),
          mutualFriends: Math.floor(Math.random() * 5), // Random number for demo purposes
          avatar: suggestion.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.display_name)}&background=6c5dd3&color=191a23&size=128`
        }));
        
        setSuggestions(formattedSuggestions);
        
        // Fetch friend requests
        const { data: requestData, error: requestError } = await supabase
          .from('friend_requests')
          .select(`
            id,
            sender_id,
            request_date,
            users!friend_requests_sender_id_fkey (
              display_name,
              avatar
            )
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
          
        if (requestError) throw requestError;
        
        // Format requests with proper typing - use a safer approach
        const formattedRequests = (requestData || []).map(request => {
          // Access properties safely
          return {
            id: request.id,
            name: request.users ? (request.users as any).display_name || 'Unknown User' : 'Unknown User',
            requestDate: format(new Date(request.request_date), 'MMM d'),
            avatar: request.users ? (request.users as any).avatar || `https://ui-avatars.com/api/?name=User&background=6c5dd3&color=191a23&size=128` : `https://ui-avatars.com/api/?name=User&background=6c5dd3&color=191a23&size=128`
          };
        });
        
        setRequests(formattedRequests);
        
      } catch (error) {
        console.error("Error fetching friend data:", error);
        toast.error("Failed to load friend data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriendData();
  }, []);

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (friend: FriendProfile) => {
    setSelectedFriend(friend);
    setShowFriendDialog(true);
  };

  const handleAddFriend = async (id: string, name: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You need to be logged in");
        return;
      }
      
      // Add friend request to Supabase
      const { error } = await supabase
        .from('friend_requests')
        .insert([
          {
            sender_id: user.id,
            receiver_id: id,
            status: 'pending'
          }
        ]);
        
      if (error) throw error;
      
      // Remove from suggestions
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
      
      toast.success(`Friend request sent to ${name}`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (id: string, name: string) => {
    try {
      // Update friend request status to accepted
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Fetch the updated friend request to get the sender info
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .select(`
          sender_id,
          users!friend_requests_sender_id_fkey (
            display_name,
            joined_date,
            avatar
          )
        `)
        .eq('id', id)
        .single();
        
      if (requestError) throw requestError;
      
      // Remove from requests
      setRequests(prev => prev.filter(req => req.id !== id));
      
      // Fetch this new friend's data to add to friends list
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Trigger a refresh by fetching all friend data again
      fetchFriendData();
      
      toast.success(`You are now friends with ${name}`);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (id: string, name: string) => {
    try {
      // Update friend request status to rejected
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from requests
      setRequests(prev => prev.filter(req => req.id !== id));
      
      toast.success(`Friend request from ${name} declined`);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
    }
  };

  // Helper function to fetch all friend data
  const fetchFriendData = async () => {
    // Implementation would be identical to the useEffect function
    // If needed, extract the implementation from useEffect here
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wolf-silver">Friends</h1>
          <p className="text-wolf-silver/60">Connect with other members</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab("suggestions")}
            className="bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
          >
            <UserPlus className="mr-2 h-5 w-5" /> Add Friends
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wolf-purple"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 bg-wolf-charcoal">
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver"
            >
              <Users className="mr-2 h-4 w-4" /> Friends
            </TabsTrigger>
            <TabsTrigger 
              value="suggestions" 
              className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Suggestions
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:text-wolf-purple data-[state=active]:bg-wolf-purple/10 text-wolf-silver"
            >
              <Mail className="mr-2 h-4 w-4" /> Requests {requests.length > 0 && (
                <Badge className="ml-2 bg-wolf-purple text-wolf-dark">{requests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wolf-silver" />
              <Input
                placeholder="Search pack members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-wolf-charcoal border-wolf-purple/20 text-white pl-10"
              />
            </div>
          </div>
          
          <TabsContent value="friends" className="space-y-6">
            {filteredFriends.length === 0 ? (
              <Card className="glass-card border-wolf-purple/20">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-wolf-purple/70 mb-2" />
                  <p className="text-wolf-silver">No friends found</p>
                  <Button 
                    onClick={() => setActiveTab("suggestions")}
                    variant="ghost" 
                    className="mt-4 text-wolf-purple"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Find friends
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFriends.map(friend => (
                  <Card key={friend.id} className="glass-card border-wolf-purple/20 hover:bg-wolf-purple/5 transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border border-wolf-purple/30">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback className="bg-wolf-purple/20 text-wolf-purple">
                            {friend.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-white">{friend.name}</h3>
                            <div className={`h-2 w-2 rounded-full ml-2 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          </div>
                          <p className="text-sm text-wolf-silver">{friend.rank} • {friend.lastActive}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="hidden md:block mr-4">
                          <StreakCounter streak={friend.streak} size="sm" showLabel={false} />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewProfile(friend)}
                          className="text-wolf-purple hover:bg-wolf-purple/10"
                        >
                          Profile <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-6">
            <Card className="glass-card border-wolf-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Suggested Pack Members</CardTitle>
                <CardDescription className="text-wolf-silver">People you might want to train with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.length > 0 ? (
                  suggestions.map(suggestion => (
                    <div key={suggestion.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-wolf-charcoal transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10 border border-wolf-purple/30">
                          <AvatarImage src={suggestion.avatar} />
                          <AvatarFallback className="bg-wolf-purple/20 text-wolf-purple">
                            {suggestion.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{suggestion.name}</h3>
                          <p className="text-sm text-wolf-silver">
                            {suggestion.mutualFriends > 0 ? `${suggestion.mutualFriends} mutual connection${suggestion.mutualFriends > 1 ? 's' : ''}` : `Joined ${suggestion.joinedDate}`}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddFriend(suggestion.id, suggestion.name)}
                        className="bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
                      >
                        <UserPlus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-wolf-silver">No suggestions available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-6">
            <Card className="glass-card border-wolf-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Friend Requests</CardTitle>
                <CardDescription className="text-wolf-silver">People who want to join your pack</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.length > 0 ? requests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-wolf-charcoal transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border border-wolf-purple/30">
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback className="bg-wolf-purple/20 text-wolf-purple">
                          {request.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">{request.name}</h3>
                        <p className="text-sm text-wolf-silver">Requested {request.requestDate}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptRequest(request.id, request.name)}
                        className="bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id, request.name)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-wolf-silver">No pending requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={showFriendDialog && selectedFriend !== null} onOpenChange={setShowFriendDialog}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white">
          {selectedFriend && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">{selectedFriend.name}'s Profile</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-wolf-purple">
                  <img 
                    src={selectedFriend.avatar} 
                    alt={selectedFriend.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <RankBadge 
                  rank={selectedFriend.rank}
                  xp={selectedFriend.xp}
                  nextRankXp={selectedFriend.nextRankXp}
                />
                
                <div className="w-full grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-wolf-charcoal p-3 rounded-lg text-center">
                    <div className="text-wolf-silver text-xs mb-1">Workouts</div>
                    <div className="text-lg font-bold text-white">{selectedFriend.totalWorkouts}</div>
                  </div>
                  
                  <div className="bg-wolf-charcoal p-3 rounded-lg text-center">
                    <div className="text-wolf-silver text-xs mb-1">Streak</div>
                    <div className="text-lg font-bold text-white">{selectedFriend.streak} days</div>
                  </div>
                </div>
                
                <div className="text-wolf-silver text-sm text-center mt-2">
                  Member since {selectedFriend.joined}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Pack;
