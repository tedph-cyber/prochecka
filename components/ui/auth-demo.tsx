"use client";

import { AuthComponent } from "./auth-component";
import { Gem } from "lucide-react";

// Example custom logo component
const CustomLogo = () => (
  <div className="bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-lg p-2">
    <Gem className="h-5 w-5" />
  </div>
);

export default function AuthDemo() {
  // Example onSubmit handler - replace with your actual authentication logic
  const handleSubmit = async (email: string, password: string) => {
    console.log("Sign up attempt:", { email, password });
    
    // Example: Call your Supabase auth here
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    // });
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // If there's an error, throw it to trigger the error modal
    // if (error) throw new Error(error.message);
  };

  return (
    <AuthComponent 
      logo={<CustomLogo />}
      brandName="Prochecka"
      onSubmit={handleSubmit}
    />
  );
}
