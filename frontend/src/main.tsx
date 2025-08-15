import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/scss/style.scss';
import Prerelease from './Prerelease';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="area-body">
      <Prerelease />
    </div>
  </StrictMode>
);
