import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { FrontendLayout } from './layouts/FrontendLayout';
import { AdminPage } from '../features/admin/pages/AdminPage';
import { AboutWorkPage } from '../features/frontend/pages/AboutWorkPage';
import { HomePage } from '../features/frontend/pages/HomePage';
import { ProjectDetailPage } from '../features/frontend/pages/ProjectDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<FrontendLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<AboutWorkPage />} />
        <Route path="/work/:slug" element={<ProjectDetailPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
