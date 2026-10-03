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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/rj-nehra" element={<RJNehra />} />
          
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cyber-crime-support" element={<CyberCrimeSupport />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/threat-intel" element={<ThreatIntel />} />
          <Route path="/cyber-news" element={<CyberNewsPortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/security-assessment" element={<SecurityAssessment />} />
          <Route path="/cyber-range" element={<CyberRange />} />
          <Route path="/tg-blogs" element={<TGBlogs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
