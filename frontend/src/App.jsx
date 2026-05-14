import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EjecutivosPage from './pages/ejecutivos/EjecutivosPage';
import ClientesPage from './pages/clientes/ClientesPage';
import ClienteDetailPage from './pages/clientes/ClienteDetailPage';
import ConfigPage from './pages/config/ConfigPage';
import CotizacionesPage from './pages/cotizaciones/CotizacionesPage';
import CotizacionDetallePage from './pages/cotizaciones/CotizacionDetallePage';
import OrdenesPage from './pages/ordenes/OrdenesPage';
import FacturasPage from './pages/facturas/FacturasPage';
import ReportesPage from './pages/reportes/ReportesPage';
import ActividadesPage from './pages/actividades/ActividadesPage';
import PipelinePage from './pages/pipeline/PipelinePage';
import RecordatoriosPage from './pages/recordatorios/RecordatoriosPage';
import ProveedoresPage from './pages/proveedores/ProveedoresPage';
import ProveedorDetailPage from './pages/proveedores/ProveedorDetailPage';
import MarcasPage from './pages/marcas/MarcasPage';
import MarcaDetailPage from './pages/marcas/MarcaDetailPage';

const LayoutWrapper = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<LayoutWrapper><DashboardPage /></LayoutWrapper>} />
          <Route path="/clientes" element={<LayoutWrapper><ClientesPage /></LayoutWrapper>} />
          <Route path="/clientes/:id" element={<LayoutWrapper><ClienteDetailPage /></LayoutWrapper>} />
          <Route path="/cotizaciones" element={<LayoutWrapper><CotizacionesPage /></LayoutWrapper>} />
          <Route path="/cotizaciones/:id" element={<LayoutWrapper><CotizacionDetallePage /></LayoutWrapper>} />
          <Route path="/ordenes" element={<LayoutWrapper><OrdenesPage /></LayoutWrapper>} />
          <Route path="/facturas" element={<LayoutWrapper><FacturasPage /></LayoutWrapper>} />
          <Route path="/actividades" element={<LayoutWrapper><ActividadesPage /></LayoutWrapper>} />
          <Route path="/pipeline" element={<LayoutWrapper><PipelinePage /></LayoutWrapper>} />
          <Route path="/recordatorios" element={<LayoutWrapper><RecordatoriosPage /></LayoutWrapper>} />
          <Route path="/reportes" element={<LayoutWrapper><ReportesPage /></LayoutWrapper>} />
          <Route path="/proveedores" element={<LayoutWrapper><ProveedoresPage /></LayoutWrapper>} />
          <Route path="/proveedores/:id" element={<LayoutWrapper><ProveedorDetailPage /></LayoutWrapper>} />
          <Route path="/marcas" element={<LayoutWrapper><MarcasPage /></LayoutWrapper>} />
          <Route path="/marcas/:id" element={<LayoutWrapper><MarcaDetailPage /></LayoutWrapper>} />
          <Route path="/ejecutivos/*" element={<LayoutWrapper><ProtectedRoute requiredRole="admin"><EjecutivosPage /></ProtectedRoute></LayoutWrapper>} />
          <Route path="/configuracion" element={<LayoutWrapper><ProtectedRoute requiredRole="admin"><ConfigPage /></ProtectedRoute></LayoutWrapper>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
