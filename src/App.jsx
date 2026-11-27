import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

import Home from './pages/Home';
import Discover from './pages/Discover';
import ExploreHobbies from './pages/ExploreHobbies';
import StudentProfile from './pages/StudentProfile';
import AddStudent from './pages/AddStudent';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Login from './pages/Login';
import './styles/messages.css';
import './styles/login.css';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');

  useEffect(() => {
    if (isMessages) {
      document.documentElement.classList.add('messages-active');
      document.body.classList.add('messages-active');
      window.scrollTo(0, 0);
    } else {
      document.documentElement.classList.remove('messages-active');
      document.body.classList.remove('messages-active');
    }
    return () => {
      document.documentElement.classList.remove('messages-active');
      document.body.classList.remove('messages-active');
    };
  }, [isMessages]);

  return (
    <AppProvider>
      <div className={`app-shell ${isMessages ? 'app-shell-messages' : ''}`}>
        <ScrollToTop />
        <Navbar onOpenLogin={() => setLoginModalOpen(true)} />

        <main className={`main-content ${isMessages ? 'main-content-messages' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/discover"
              element={<Discover onOpenLogin={() => setLoginModalOpen(true)} />}
            />
            <Route path="/hobbies" element={<ExploreHobbies />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/connections" element={<Connections onOpenLogin={() => setLoginModalOpen(true)} />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:studentId" element={<Messages />} />
            <Route path="/login" element={<Login />} />
            {/* Route aliases and safety fallbacks */}
            <Route path="/add student" element={<Navigate to="/add-student" replace />} />
            <Route path="/add%20student" element={<Navigate to="/add-student" replace />} />
            <Route path="/add_student" element={<Navigate to="/add-student" replace />} />
            <Route path="/addstudent" element={<Navigate to="/add-student" replace />} />
            <Route path="/my-profile" element={<Navigate to="/discover" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isMessages && <Footer />}
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3200,
            style: {
              borderRadius: '16px',
              background: '#30245F',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              padding: '12px 16px',
              boxShadow: '0 14px 32px rgba(48, 36, 95, 0.22)',
            },
          }}
        />
      </div>
    </AppProvider>
  );
}
