import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StoryPage from "./pages/StoryPage";
import MediaPage from "./pages/MediaPage";
import ProjectsPage from "./pages/ProjectsPage";
import NetworkPage from "./pages/NetworkPage";
import BlueprintsPage from "./pages/BlueprintsPage";
import PoemsPage from "./pages/PoemsPage";
import PicturesPage from "./pages/PicturesPage";
import OpsPage from "./pages/OpsPage";
import ResumePage from "./pages/ResumePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/blueprints" element={<BlueprintsPage />} />
          <Route path="/poems" element={<PoemsPage />} />
          <Route path="/pictures" element={<PicturesPage />} />
          <Route path="/ops" element={<OpsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
