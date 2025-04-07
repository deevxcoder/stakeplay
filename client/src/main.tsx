import { createRoot } from "react-dom/client";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <App />
    </UserProvider>
  </QueryClientProvider>
);
