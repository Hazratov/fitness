
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ContentList from "./pages/ContentList";
import AddEditContent from "./pages/AddEditContent";
import { ContentProvider } from "./contexts/ContentContext";
import  AddContent  from "./pages/AddContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ContentProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/content" element={<ContentList />} />
            <Route path="/add-content" element={<AddContent/>} />
            <Route path="/edit-exercise/:id" element={<AddEditContent type="mashqlar" />} />
            <Route path="/edit-meal/:id" element={<AddEditContent type="taomnoma" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ContentProvider>
  </QueryClientProvider>
);

export default App;
