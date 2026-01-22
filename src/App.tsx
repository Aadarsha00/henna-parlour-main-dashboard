import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "./components/layout/App-Layout";
import AllServicesPage from "./components/Services/Get-AllServices";
import AddServicePage from "./components/Services/AddService";
import UpdateServicePage from "./components/Services/Update-Service";
import ServiceDetailPage from "./components/Services/Service-Detail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./context/ProtectedRoute";
import Appointment from "./pages/Appointment/Appointment";
import Blogs from "./pages/Blog/All-Blogs";
import CreateBlog from "./pages/Blog/Create-Blog";
import UpdateBlog from "./pages/Blog/Update-Blog";
import BlogDetail from "./pages/Blog/Blog-Detail";
import Gallery from "./pages/Gallery/All-Gallery";
import AddGallery from "./pages/Gallery/Add-Gallery";

function App() {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Services Routes */}
                <Route path="/services" element={<AllServicesPage />} />
                <Route path="/services/add" element={<AddServicePage />} />
                <Route
                  path="/services/update/:id"
                  element={<UpdateServicePage />}
                />
                <Route path="/services/:id" element={<ServiceDetailPage />} />

                {/*Appointment Routes */}
                <Route path="/appointments" element={<Appointment />} />

                {/*Blog Routes */}
                <Route path="/blog" element={<Blogs />} />
                <Route path="/blog/create" element={<CreateBlog />} />
                <Route path="/blog/edit/:slug" element={<UpdateBlog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />

                {/*Gallery Routes */}
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/add" element={<AddGallery />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
