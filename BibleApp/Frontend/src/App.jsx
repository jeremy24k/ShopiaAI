import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/AuthStore';
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
  const { checkUser, user } = useAuthStore();
  const { fetchAllBookProgress, getCompleteChapter, bookProgress } = useTrackingBookStore();
  const { loadRecentlyRead } = useRecentlyReadStore();
  const recentlyRead = useRecentlyReadStore(state => state.recentlyRead);

  // Initialize auth on mount
  useEffect(() => { 
    checkUser();
  }, []);

  // 🔥 Cargar progreso de forma global cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      console.log('🔄 Loading user data globally...');
      getCompleteChapter(); // Cargar capítulos completados
      fetchAllBookProgress(); // Cargar progreso de libros
    }
  }, [user, getCompleteChapter, fetchAllBookProgress]);

  useEffect(() => {
    console.log('🔄 bookProgress', bookProgress);
  }, [bookProgress]);

  useEffect(() => {
    // Only load when auth is done and user exists
    if (user) {
      loadRecentlyRead();
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 recentlyRead', recentlyRead);
  }, [recentlyRead]);


  return (
    <ErrorBoundary>
      <ContainerApp>
        <Outlet />
        <NotificationContainer />
      </ContainerApp>
    </ErrorBoundary>
  )
}

// Layout wrapper component with Suspense
function LayoutWrapper({ children }) {
  return (
    <Layout>
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Cargando...</div>}>
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
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
