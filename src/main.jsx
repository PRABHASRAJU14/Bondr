import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

import './styles/variables.css';
import './styles/global.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/discover.css';
import './styles/student-card.css';
import './styles/hobbies.css';
import './styles/profile.css';
import './styles/forms.css';
import './styles/connections.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
