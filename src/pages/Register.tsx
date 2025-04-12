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
import supabase from "@/lib/supabaseClient";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Register user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create a user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              display_name: data.displayName,
              email: data.email,
              password_hash: '', // Auth handles the password, this is for schema compatibility
              fitness_goal: 'overall',
              weight_unit: 'kg',
              joined_date: new Date().toISOString(),
            }
          ]);

        if (profileError) throw profileError;

        toast.success("Account created successfully!", {
          description: "You're now a member of MyPack!",
        });

        // Navigate to dashboard after successful registration
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle different types of errors
      if (error.message.includes("email")) {
        toast.error("Registration failed", {
          description: "This email is already in use.",
        });
      } else {
        toast.error("Registration failed", {
          description: error.message || "Please try again later",
        });
      }
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
          <h1 className="text-2xl font-bold wolf-text-gradient">Join MyPack</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-wolf-silver">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SilverFang"
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
                      type="email"
                      placeholder="yourname@example.com"
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
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-wolf-silver text-sm">
            Already a member?{" "}
            <Link to="/login" className="text-wolf-purple hover:text-wolf-accent">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
