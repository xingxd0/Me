import { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { PortfolioContentProvider } from '../../features/portfolio/content/PortfolioContentProvider';
import { ScrollToTop } from './ScrollToTop';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PortfolioContentProvider>
      <HashRouter>
        <ScrollToTop />
        {children}
      </HashRouter>
    </PortfolioContentProvider>
  );
}
