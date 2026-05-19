import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DearReaderPage from "./pages/DearReaderPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContentPage from "./pages/ContentPage";
import ProjectsPage from "./pages/ProjectsPage";
import NetworkPage from "./pages/NetworkPage";
import BlueprintsPage from "./pages/BlueprintsPage";
import MentalModelsPage from "./pages/MentalModelsPage";
import PoemsPage from "./pages/PoemsPage";
import PicturesPage from "./pages/PicturesPage";
import BuildsPage from "./pages/BuildsPage";
import ResumePage from "./pages/ResumePage";
import ReferencesPage from "./pages/ReferencesPage";
import SonderPage from "./pages/SonderPage";
import WritingPage from "./pages/WritingPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DearReaderPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/blueprints" element={<BlueprintsPage />} />
        <Route path="/blueprints/mental-models" element={<MentalModelsPage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/pictures" element={<PicturesPage />} />
        <Route path="/builds" element={<BuildsPage />} />
        <Route path="/poetry" element={<Navigate to="/poems" replace />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/references" element={<ReferencesPage />} />
        <Route path="/sonder" element={<SonderPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
