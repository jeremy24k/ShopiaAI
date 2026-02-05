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

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: <LayoutWrapper><Home /></LayoutWrapper>
      },
      {
        path: "/books/*",
        element: <LayoutWrapper><Read /></LayoutWrapper>
      },
      {
        path: "/favorites",
        element: <LayoutWrapper><Favorites /></LayoutWrapper>
      },
      {
        path: "/notes/*",
        element: <LayoutWrapper><Notes /></LayoutWrapper>
      },
      {
        path: "/ai",
        element: <LayoutWrapper><AI /></LayoutWrapper>
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/admin/feedback",
        element: <LayoutWrapper><AdminRoute><FeedbackDashboard /></AdminRoute></LayoutWrapper>
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
