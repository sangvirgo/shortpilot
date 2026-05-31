import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ideas from './pages/Ideas';
import StockSearch from './pages/StockSearch';
import VideoLibrary from './pages/VideoLibrary';
import VideoDetail from './pages/VideoDetail';
import CaptionGenerator from './pages/CaptionGenerator';
import DraftManager from './pages/DraftManager';
import Publisher from './pages/Publisher';
import Metrics from './pages/Metrics';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/stock" element={<StockSearch />} />
            <Route path="/videos" element={<VideoLibrary />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/captions" element={<CaptionGenerator />} />
            <Route path="/drafts" element={<DraftManager />} />
            <Route path="/publisher" element={<Publisher />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
