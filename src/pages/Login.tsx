import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">PlayGround</h2>
        <p className="text-muted-foreground text-center mb-6">Sign in to access your sandbox</p>
        
        <Auth
          supabaseClient={supabase}
          redirectTo={new URL("/", window.location.origin).href}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#50C878",
                  brandHover: "#45b06a",
                },
              },
            },
          }}
          theme="light"
        />
      </div>
    </div>
  );
}

export default Login;