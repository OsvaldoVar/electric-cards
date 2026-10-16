import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GameProvider } from '../state/GameProvider';
import { Layout } from './layout/Layout';

const Home = lazy(() => import('../features/home/pages/Home'));
const Levels = lazy(() => import('../features/progression/pages/Levels'));
const Puzzle = lazy(() => import('../features/puzzle/pages/Puzzle'));
const Learn = lazy(() => import('../features/learning/pages/Learn'));
const GateDetails = lazy(() => import('../features/learning/pages/GateDetails'));
const NotFound = lazy(() => import('../shared/ui/NotFound'));

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="loading-screen" role="status">
              Preparando el laboratorio…
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="levels" element={<Levels />} />
              <Route path="puzzle/:id" element={<Puzzle />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:gate" element={<GateDetails />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GameProvider>
  );
}
