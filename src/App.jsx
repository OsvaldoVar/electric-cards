import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GameProvider } from './context/GameProvider';
import { Layout } from './components/Layout/Layout';

const Home = lazy(() => import('./pages/Home'));
const Levels = lazy(() => import('./pages/Levels'));
const Puzzle = lazy(() => import('./pages/Puzzle'));
const Learn = lazy(() => import('./pages/Learn'));
const GateDetails = lazy(() => import('./pages/GateDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
