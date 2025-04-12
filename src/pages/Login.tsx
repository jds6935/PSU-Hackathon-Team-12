
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // In a real implementation, this would connect to Supabase
      console.log("Logging in with:", data);
      
      // Show toast for now since we don't have Supabase integration yet
      toast.success("Welcome back to the pack!", {
        description: "Login successful",
      });
      
      // Simulate a delay for demo purposes
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wolf-dark p-4">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2 text-wolf-silver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold wolf-text-gradient">Return To The Pack</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-wolf-silver">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="alpha@wolfpack.com"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-wolf-silver">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-wolf-charcoal border-wolf-purple/20 text-white"
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
              className="w-full h-11 font-medium bg-wolf-purple hover:bg-wolf-accent text-wolf-dark"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-wolf-silver text-sm">
            New to the pack?{" "}
            <Link to="/register" className="text-wolf-purple hover:text-wolf-accent">
              Join Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
