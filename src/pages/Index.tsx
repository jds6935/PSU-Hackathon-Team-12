import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import wolfLogo from "/PackImage.png";

const Index = () => {
  const navigate = useNavigate();

  // TODO: Fetch any necessary data from Supabase for the landing page (e.g., stats, announcements)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wolf-dark relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-wolf-dark via-wolf-dark to-wolf-charcoal opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/d5aa01af-6cd1-46cb-bf31-145dc1a9ce28.png')] bg-cover bg-center opacity-20"></div>
      </div>
      
      <div className="z-10 w-full max-w-md px-4 py-8 glass-card my-8">
        <div className="flex flex-col items-center text-center">
          <img 
            src={wolfLogo} 
            alt="MyPack Logo" 
            className="w-24 h-24 mb-6 rounded-full border-2 border-wolf-purple" 
          />
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 wolf-text-gradient">
            MYPACK
          </h1>
          <p className="text-wolf-silver text-lg mb-8">Rise through the ranks. Become the Alpha.</p>
          
          <div className="flex flex-col gap-4 w-full">
            <Button 
              onClick={() => navigate("/login")}
              variant="outline" 
              className="h-12 text-lg font-semibold border-wolf-purple text-wolf-purple hover:bg-wolf-purple/10"
            >
              Log In
            </Button>
            
            <Button 
              onClick={() => navigate("/register")}
              className="h-12 text-lg font-semibold bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
            >
              Join The Pack
            </Button>
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <p className="text-xs text-wolf-silver/60 mb-2">STRENGTH IN NUMBERS</p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-wolf-purple animate-pulse-subtle"></div>
              <div className="w-2 h-2 rounded-full bg-wolf-purple animate-pulse-subtle delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-wolf-purple animate-pulse-subtle delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
