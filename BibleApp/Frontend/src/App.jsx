import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/AuthStore';
import { useThemeStore } from './store/ThemeStore';
import { useTrackingBookStore } from './store/TrackingBookStore';
import { useRecentlyReadStore } from "./store/RecentlyReadStore";
import ErrorBoundary from './components/ErrorBoundary';
import RouteError from './components/RouteError'
import Layout from './components/Layout';
import ContainerApp from './components/ContainerApp';
import FeedbackDashboard from './components/admin/FeedbackDashboard';
import AdminRoute from './components/AdminRoute';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/animations.css';

// Lazy loading components
const Home = lazy(() => import('./pages/Home'));
const Read = lazy(() => import('./pages/Read'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Notes = lazy(() => import('./pages/Notes'));
const AI = lazy(() => import('./pages/AI'));
const Login = lazy(() => import('./pages/Login'));


// App wrapper component with ErrorBoundary
function AppWrapper() {
  // Estado (causa re-renders cuando cambia)
  const user = useAuthStore(state => state.user);
  
  // Acciones (no causan re-renders)
  const checkUser = useAuthStore(state => state.checkUser);
  const initTheme = useThemeStore(state => state.initTheme);

  // Initialize auth and theme on mount
  useEffect(() => { 
    checkUser();
    initTheme();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      // Call functions directly from store to avoid dependency issues
      useTrackingBookStore.getState().getCompleteChapter();
      useTrackingBookStore.getState().fetchAllBookProgress();
      useRecentlyReadStore.getState().loadRecentlyRead();
    }
  }, [user]);


  return (
    <ErrorBoundary>
      <ContainerApp>
        <Outlet />
        <NotificationContainer />
      </ContainerApp>
    </ErrorBoundary>
  )
}

// Get loading text based on stored language preference
function getLoadingText() {
  try {
    const stored = localStorage.getItem('language-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.language === 'en') return 'Loading...';
    }
  } catch { /* fallback to spanish */ }
  return 'Cargando...';
}

// Layout wrapper component with Suspense
function LayoutWrapper({ children }) {
  return (
    <Layout>
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>{getLoadingText()}</div>}>
        {children}
      </Suspense>
    </Layout>
  )
}

// Router configuration: /login is public; all other routes require authentication
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
    errorElement: <RouteError />,
    children: [
      {
        path: "login",
        element: <Login />
      },
      {
        element: (
          <ProtectedRoute>
            <LayoutWrapper>
              <Outlet />
            </LayoutWrapper>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Home />
          },
          {
            path: "books/*",
            element: <Read />
          },
          {
            path: "favorites",
            element: <Favorites />
          },
          {
            path: "notes/*",
            element: <Notes />
          },
          {
            path: "ai",
            element: <AI />
          },
          {
            path: "ai/:conversationId",
            element: <AI />
          },
          {
            path: "admin/feedback",
            element: <AdminRoute><FeedbackDashboard /></AdminRoute>
          }
        ]
      },
      {
        path: "*",
        element: <RouteError />
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
