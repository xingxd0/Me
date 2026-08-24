import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PortfolioContentProvider } from '../../features/portfolio/content/PortfolioContentProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PortfolioContentProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </PortfolioContentProvider>
  );
}
