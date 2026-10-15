import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useLayout } from "@/lib/layout";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

const About = lazy(() => import("./pages/About.tsx"));
const CyberPortal = lazy(() => import("./pages/CyberPortal.tsx"));
const PdfProduct = lazy(() => import("./pages/PdfStore.tsx").then((m) => ({ default: m.PdfProduct })));
const PdfStore = lazy(() => import("./pages/PdfStore.tsx").then((m) => ({ default: m.PdfStore })));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.tsx"));
const CyberCrimeSupport = lazy(() => import("./pages/CyberCrimeSupport.tsx"));
const ThreatIntel = lazy(() => import("./pages/ThreatIntel.tsx"));
const CyberNewsPortal = lazy(() => import("./pages/CyberNewsPortal.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Manage = lazy(() => import("./pages/Manage.tsx"));
const SecurityAssessment = lazy(() => import("./pages/SecurityAssessment.tsx"));
const TGBlogs = lazy(() => import("./pages/TGBlogs.tsx"));
const CyberRange = lazy(() => import("./pages/CyberRange.tsx"));
const RJNehra = lazy(() => import("./pages/RJNehra.tsx"));
const TrainingDetail = lazy(() => import("./pages/Training.tsx").then((m) => ({ default: m.TrainingDetail })));
const TrainingList = lazy(() => import("./pages/Training.tsx").then((m) => ({ default: m.TrainingList })));
const ProductDetail = lazy(() => import("./pages/Products.tsx").then((m) => ({ default: m.ProductDetail })));
const ProductList = lazy(() => import("./pages/Products.tsx").then((m) => ({ default: m.ProductList })));
const Events = lazy(() => import("./pages/Events.tsx"));

// Pages the admin switched off in Manage → Sections & Pages show "not found".
const Gate = ({ path, children }: { path: string; children: ReactNode }) => {
  const layout = useLayout();
  return layout.hiddenPages.includes(path) ? <NotFound /> : <>{children}</>;
};

// Static pages served next to the app (account.html), reached from an app route.
const StaticPage = ({ href }: { href: string }) => {
  window.location.replace(href);
  return null;
};

// New page: start at the top (unless the link points to a section).
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
};

const PageLoading = () => <div className="min-h-screen bg-background" aria-busy="true" />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<Gate path="/about"><About /></Gate>} />
          <Route path="/rj-nehra" element={<Gate path="/rj-nehra"><RJNehra /></Gate>} />
          
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/training" element={<Gate path="/training"><TrainingList /></Gate>} />
          <Route path="/training/:id" element={<Gate path="/training"><TrainingDetail /></Gate>} />
          <Route path="/courses" element={<Navigate to="/training" replace />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/products" element={<Gate path="/products"><ProductList /></Gate>} />
          <Route path="/products/:id" element={<Gate path="/products"><ProductDetail /></Gate>} />
          <Route path="/events" element={<Gate path="/events"><Events /></Gate>} />
          <Route path="/blog" element={<Gate path="/blog"><Blog /></Gate>} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cyber-crime-support" element={<Gate path="/cyber-crime-support"><CyberCrimeSupport /></Gate>} />
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/pdf-store" element={<Gate path="/pdf-store"><PdfStore /></Gate>} />
          <Route path="/pdf-store/:id" element={<Gate path="/pdf-store"><PdfProduct /></Gate>} />
          <Route path="/cyber-portal" element={<Gate path="/cyber-portal"><CyberPortal /></Gate>} />
          <Route path="/threat-intel" element={<Gate path="/threat-intel"><ThreatIntel /></Gate>} />
          <Route path="/cyber-news" element={<Gate path="/cyber-news"><CyberNewsPortal /></Gate>} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<StaticPage href="/account.html" />} />
          <Route path="/my-account" element={<StaticPage href="/account.html" />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/security-assessment" element={<Gate path="/security-assessment"><SecurityAssessment /></Gate>} />
          <Route path="/cyber-range" element={<Gate path="/cyber-range"><CyberRange /></Gate>} />
          <Route path="/tg-blogs" element={<Gate path="/tg-blogs"><TGBlogs /></Gate>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
