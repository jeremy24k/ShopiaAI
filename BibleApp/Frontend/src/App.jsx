import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/AuthStore';
import { useTrackingBookStore } from './store/TrackingBookStore'; // ⭐ Nuevo
import ErrorBoundary from './components/ErrorBoundary';
import RouteError from './components/RouteError'
import Layout from './components/Layout';
import ContainerApp from './components/ContainerApp';

// Lazy loading components
const Home = lazy(() => import('./components/Home'));
const Read = lazy(() => import('./components/Read'));
const Favorites = lazy(() => import('./components/Favorites'));
const Notes = lazy(() => import('./components/Notes'));
const AI = lazy(() => import('./components/AI'));
const Login = lazy(() => import('./components/Login'));

// App wrapper component with ErrorBoundary
function AppWrapper() {
  const { checkUser, user } = useAuthStore();
  const { fetchAllBookProgress, getCompleteChapter } = useTrackingBookStore(); // ⭐ Nuevo

  // Initialize auth on mount
  useEffect(() => { 
    checkUser();
  }, [checkUser]);

  // 🔥 Cargar progreso de forma global cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      console.log('🔄 Loading user data globally...');
      getCompleteChapter(); // Cargar capítulos completados
      fetchAllBookProgress(); // Cargar progreso de libros
    }
  }, [user, getCompleteChapter, fetchAllBookProgress]);

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
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
