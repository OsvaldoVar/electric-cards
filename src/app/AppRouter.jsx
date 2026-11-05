import { BrowserRouter, HashRouter } from 'react-router-dom';
import { usesHashRouting } from './routerMode';

const Router = usesHashRouting ? HashRouter : BrowserRouter;

export function AppRouter({ children }) {
  return <Router>{children}</Router>;
}
