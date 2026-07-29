import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Loader2 } from "lucide-react";

import { AppLayout } from "./components/layout/App-Layout";
import ProtectedRoute from "./context/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const AllServicesPage = lazy(
  () => import("./components/Services/Get-AllServices")
);
const AddServicePage = lazy(() => import("./components/Services/AddService"));
const UpdateServicePage = lazy(
  () => import("./components/Services/Update-Service")
);
const ServiceDetailPage = lazy(
  () => import("./components/Services/Service-Detail")
);
const Appointment = lazy(
  () => import("./pages/Appointment/Appointment")
);
const Blogs = lazy(() => import("./pages/Blog/All-Blogs"));
const CreateBlog = lazy(() => import("./pages/Blog/Create-Blog"));
const UpdateBlog = lazy(() => import("./pages/Blog/Update-Blog"));
const BlogDetail = lazy(() => import("./pages/Blog/Blog-Detail"));
const Gallery = lazy(() => import("./pages/Gallery/All-Gallery"));
const AddGallery = lazy(() => import("./pages/Gallery/Add-Gallery"));
const Messages = lazy(
  () => import("./components/Messages/Messages-Dashboard")
);
const Promotions = lazy(
  () => import("./components/Promotions/Promotions-Dashboard")
);
const Closures = lazy(
  () => import("./components/Closures/Closures-Dashboard")
);
const Notes = lazy(() => import("./components/Notes/Notes-Dashboard"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-700">Loading…</span>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/services" element={<AllServicesPage />} />
                    <Route path="/services/add" element={<AddServicePage />} />
                    <Route
                      path="/services/update/:id"
                      element={<UpdateServicePage />}
                    />
                    <Route
                      path="/services/:id"
                      element={<ServiceDetailPage />}
                    />
                    <Route path="/appointments" element={<Appointment />} />
                    <Route path="/blog" element={<Blogs />} />
                    <Route path="/blog/create" element={<CreateBlog />} />
                    <Route path="/blog/edit/:slug" element={<UpdateBlog />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/gallery/add" element={<AddGallery />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/promotions" element={<Promotions />} />
                    <Route path="/closures" element={<Closures />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
