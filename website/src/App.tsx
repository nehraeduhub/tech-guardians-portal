import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import About from "./pages/About.tsx";
import Admin from "./pages/Admin.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import CyberCrimeSupport from "./pages/CyberCrimeSupport.tsx";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ThreatIntel from "./pages/ThreatIntel.tsx";
import CyberNewsPortal from "./pages/CyberNewsPortal.tsx";
import Login from "./pages/Login.tsx";
import Manage from "./pages/Manage.tsx";
import SecurityAssessment from "./pages/SecurityAssessment.tsx";
import TGBlogs from "./pages/TGBlogs.tsx";
import CyberRange from "./pages/CyberRange.tsx";
import RJNehra from "./pages/RJNehra.tsx";
import { useLayout } from "@/lib/layout";
import type { ReactNode } from "react";

// Pages the admin switched off in Manage → Sections & Pages show "not found".
const Gate = ({ path, children }: { path: string; children: ReactNode }) => {
  const layout = useLayout();
  return layout.hiddenPages.includes(path) ? <NotFound /> : <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<Gate path="/about"><About /></Gate>} />
          <Route path="/rj-nehra" element={<Gate path="/rj-nehra"><RJNehra /></Gate>} />
          
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/blog" element={<Gate path="/blog"><Blog /></Gate>} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cyber-crime-support" element={<Gate path="/cyber-crime-support"><CyberCrimeSupport /></Gate>} />
          <Route path="/admin" element={<Gate path="/admin"><Admin /></Gate>} />
          <Route path="/threat-intel" element={<Gate path="/threat-intel"><ThreatIntel /></Gate>} />
          <Route path="/cyber-news" element={<Gate path="/cyber-news"><CyberNewsPortal /></Gate>} />
          <Route path="/login" element={<Login />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/security-assessment" element={<Gate path="/security-assessment"><SecurityAssessment /></Gate>} />
          <Route path="/cyber-range" element={<Gate path="/cyber-range"><CyberRange /></Gate>} />
          <Route path="/tg-blogs" element={<Gate path="/tg-blogs"><TGBlogs /></Gate>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
