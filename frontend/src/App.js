/**
 * Softogram SPA router — slimmed for code-splitting (issues #14).
 * Legacy cyan marketing page removed from the bundle.
 */
import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/redesign/Layout";
import ConsentBanner from "@/components/ConsentBanner";
import ScrollToHash from "@/components/ScrollToHash";

const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ClientWork = lazy(() => import("@/pages/ClientWork"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() =>
  import("@/pages/policies").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsAndConditions = lazy(() =>
  import("@/pages/policies").then((m) => ({ default: m.TermsAndConditions })),
);
const RefundPolicy = lazy(() =>
  import("@/pages/policies").then((m) => ({ default: m.RefundPolicy })),
);
const CookiePolicy = lazy(() =>
  import("@/pages/policies").then((m) => ({ default: m.CookiePolicy })),
);

function RouteFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0d1117", color: "#8b949e", fontFamily: "var(--font-mono)" }}
      data-testid="route-loading"
    >
      loading…
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToHash />
        <Toaster position="top-center" richColors theme="dark" />
        <ConsentBanner />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/client-work" element={<ClientWork />} />
              <Route path="/case-studies" element={<Navigate to="/client-work" replace />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
