import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import StoryPage from "./pages/StoryPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContentPage from "./pages/ContentPage";
import ProjectsPage from "./pages/ProjectsPage";
import NetworkPage from "./pages/NetworkPage";
import BlueprintsPage from "./pages/BlueprintsPage";
import PoemsPage from "./pages/PoemsPage";
import PicturesPage from "./pages/PicturesPage";
import BuildsPage from "./pages/BuildsPage";
import ResumePage from "./pages/ResumePage";
import ReferencesPage from "./pages/ReferencesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/museum" element={<Index />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/blueprints" element={<BlueprintsPage />} />
          <Route path="/poems" element={<PoemsPage />} />
          <Route path="/pictures" element={<PicturesPage />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/ops" element={<Navigate to="/builds" replace />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;