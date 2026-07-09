import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Items from './pages/Items';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import Dashboard from './pages/Dashboard';
import ListItem from './pages/ListItem';
import Rentals from './pages/Rentals';
import Profile from './pages/Profile';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }, [pathname]);

  return null;
};

const ScrollAnimations = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selectors = [
      '.tc-page-head',
      '.tc-trust-band',
      '.tc-dashboard-stats',
      '.tc-filters',
      '.tc-grid-wrap',
      '.tc-form-layout',
      '.tc-profile-layout',
      '.tc-section-card',
      '.tc-detail-grid',
      '.tc-owner-card',
      '.tc-info-panel',
      '.tc-form-card',
      '.tc-item-card',
      '.item-card',
      '.auth-card',
      '.page-header',
      '.items-grid'
    ].join(',');

    const reveal = () => {
      const elements = Array.from(document.querySelectorAll(selectors));

      if (reduceMotion) {
        elements.forEach((element) => element.classList.add('app-scroll-visible'));
        return undefined;
      }

      elements.forEach((element) => {
        element.classList.add('app-scroll-reveal');
        element.classList.remove('app-scroll-visible');
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('app-scroll-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -56px 0px' }
      );

      elements.forEach((element) => observer.observe(element));
      return observer;
    };

    let observer;
    const frame = window.requestAnimationFrame(() => {
      observer = reveal();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
};

// Layout
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ScrollAnimations />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/items/new" element={
              <ProtectedRoute><ListItem /></ProtectedRoute>
            } />
            <Route path="/rentals" element={
              <ProtectedRoute><Rentals /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
