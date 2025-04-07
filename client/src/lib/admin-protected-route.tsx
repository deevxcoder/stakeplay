import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type AdminProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log("AdminProtectedRoute - No user, redirecting to /auth");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user is available, just check the isAdmin flag
  if (!user.isAdmin) {
    console.log("AdminProtectedRoute - Not admin, redirecting to /");
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  console.log("AdminProtectedRoute - Admin confirmed, rendering component");
  return <Route path={path} component={Component} />;
}