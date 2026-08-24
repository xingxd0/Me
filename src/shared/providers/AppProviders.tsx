import { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { PortfolioContentProvider } from '../../features/portfolio/content/PortfolioContentProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PortfolioContentProvider>
      <HashRouter>{children}</HashRouter>
    </PortfolioContentProvider>
  );
}
