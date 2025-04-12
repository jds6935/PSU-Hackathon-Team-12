
import { useState } from "react";
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

import StreakCounter from "@/components/StreakCounter";
import RankBadge from "@/components/RankBadge";
import { CustomProgress } from "@/components/ui/custom-progress";
import { FriendProfile } from "@/types/workout";

// Mock data for friends
const mockFriends: FriendProfile[] = [
  {
    id: "1",
    name: "Alex Wolf",
    rank: "Alpha Wolf",
    xp: 690,
    nextRankXp: 750,
    streak: 8,
    totalWorkouts: 45,
    joined: "January 2023",
    avatar: "/public/lovable-uploads/09661d06-c457-416e-9cc4-69eca6a35989.png",
    lastActive: "2 hours ago",
    status: "online"
  },
  {
    id: "2",
    name: "Sarah Hunter",
    rank: "Beta Wolf",
    xp: 410,
    nextRankXp: 450,
    streak: 5,
    totalWorkouts: 32,
    joined: "February 2023",
    avatar: "",
    lastActive: "10 minutes ago",
    status: "online"
  },
  {
    id: "3",
    name: "Mike Thunder",
    rank: "Howler",
    xp: 320,
    nextRankXp: 450,
    streak: 3,
    totalWorkouts: 27,
    joined: "March 2023",
    avatar: "",
    lastActive: "1 day ago",
    status: "offline"
  }
];

// Mock data for friend suggestions
const mockSuggestions = [
  { id: "4", name: "Jessica Power", joinedDate: "April 2023", mutualFriends: 2, avatar: "" },
  { id: "5", name: "David Strong", joinedDate: "May 2023", mutualFriends: 1, avatar: "" },
  { id: "6", name: "Emma Lift", joinedDate: "March 2023", mutualFriends: 3, avatar: "" }
];

// Mock data for friend requests
const mockRequests = [
  { id: "7", name: "Ryan Beast", requestDate: "2 days ago", avatar: "" },
  { id: "8", name: "Olivia Muscle", requestDate: "5 days ago", avatar: "" }
];

const Pack = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  
  // Filter friends based on search
  const filteredFriends = mockFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewProfile = (friend: FriendProfile) => {
    setSelectedFriend(friend);
    setShowFriendDialog(true);
  };
  
  const handleAddFriend = (id: string, name: string) => {
    toast.success(`Friend request sent to ${name}`);
  };
  
  const handleAcceptRequest = (id: string, name: string) => {
    toast.success(`You are now friends with ${name}`);
  };
  
  const handleRejectRequest = (id: string, name: string) => {
    toast.success(`Friend request from ${name} declined`);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wolf-silver">Pack</h1>
          <p className="text-wolf-silver/60">Train with your fellow wolves</p>
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
            <Mail className="mr-2 h-4 w-4" /> Requests {mockRequests.length > 0 && (
              <Badge className="ml-2 bg-wolf-purple text-wolf-dark">{mockRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Search bar (shown on all tabs) */}
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
        
        {/* Friends Tab Content */}
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
        
        {/* Suggestions Tab Content */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card className="glass-card border-wolf-purple/20">
            <CardHeader>
              <CardTitle className="text-white">Suggested Pack Members</CardTitle>
              <CardDescription className="text-wolf-silver">People you might want to train with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSuggestions.map(suggestion => (
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
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Requests Tab Content */}
        <TabsContent value="requests" className="space-y-6">
          <Card className="glass-card border-wolf-purple/20">
            <CardHeader>
              <CardTitle className="text-white">Friend Requests</CardTitle>
              <CardDescription className="text-wolf-silver">People who want to join your pack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRequests.length > 0 ? mockRequests.map(request => (
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
      
      {/* Friend Profile Dialog */}
      <Dialog open={showFriendDialog && selectedFriend !== null} onOpenChange={setShowFriendDialog}>
        <DialogContent className="glass-card border-wolf-purple/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-2 wolf-text-gradient">{selectedFriend?.name}</DialogTitle>
            <DialogDescription className="text-center text-wolf-silver">{selectedFriend?.rank}</DialogDescription>
          </DialogHeader>
          
          {selectedFriend && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-1">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-2 border-wolf-purple mb-4">
                    <AvatarImage src={selectedFriend.avatar} />
                    <AvatarFallback className="bg-wolf-purple/20 text-wolf-purple text-2xl">
                      {selectedFriend.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full bg-wolf-charcoal rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-wolf-silver text-sm">XP Progress</span>
                      <span className="text-wolf-purple font-medium">{selectedFriend.xp}/{selectedFriend.nextRankXp}</span>
                    </div>
                    <CustomProgress 
                      value={(selectedFriend.xp / selectedFriend.nextRankXp) * 100} 
                      className="h-2 bg-wolf-dark" 
                      indicatorClassName="bg-wolf-purple" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <div className="bg-wolf-charcoal rounded-lg p-4 flex flex-col items-center">
                      <Activity className="h-6 w-6 text-wolf-purple mb-2" />
                      <span className="text-wolf-silver text-sm">Workouts</span>
                      <span className="text-xl font-bold text-white">{selectedFriend.totalWorkouts}</span>
                    </div>
                    <div className="bg-wolf-charcoal rounded-lg p-4 flex flex-col items-center">
                      <CalendarCheck className="h-6 w-6 text-wolf-purple mb-2" />
                      <span className="text-wolf-silver text-sm">Streak</span>
                      <span className="text-xl font-bold text-white">{selectedFriend.streak}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-wolf-purple/30 text-wolf-purple hover:bg-wolf-purple/10"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Pack;
