import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { BooksContextProvider } from './context/BooksContext';  
import { VersesNotesContextProvider } from './context/VersesNotesContext';
import { AuthContextProvider } from './context/AuthContext';
import { AiContextProvider } from './context/AiContext';
import { FavoritesContextProvider } from './context/FavoritesContext';
import { NotesContextProvider } from './context/NotesContext';
import { UIcontextProvider } from './context/UIcontext';
import { ReadingContextProvider } from './context/ReadingContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css'
import RouteError from './components/RouteError'
import Layout from './components/Layout';
import ContainerApp from './components/ContainerApp';

// ✅ Lazy loading de componentes de rutas
const Home = lazy(() => import('./components/Home'));
const Read = lazy(() => import('./components/Read'));
const Favorites = lazy(() => import('./components/Favorites'));
const Notes = lazy(() => import('./components/Notes'));
const AI = lazy(() => import('./components/AI'));
const Login = lazy(() => import('./components/Login'));

// Componente wrapper para los providers con ErrorBoundary
function AppProviders() {
  return (
    <ErrorBoundary>
      <AuthContextProvider>
        <BooksContextProvider>
          <VersesNotesContextProvider>
            <NotesContextProvider>
              <FavoritesContextProvider>
                  <AiContextProvider>
                      <ReadingContextProvider>
                        <UIcontextProvider>
                          <ContainerApp>
                            <Outlet />
                          </ContainerApp>
                        </UIcontextProvider>
                      </ReadingContextProvider>
                  </AiContextProvider>
              </FavoritesContextProvider>
            </NotesContextProvider>
          </VersesNotesContextProvider>
        </BooksContextProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  )
}

// Componente wrapper para rutas con layout y Suspense
function LayoutWrapper({ children }) {
  return (
    <Layout>
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Cargando...</div>}>
        {children}
      </Suspense>
    </Layout>
  )
}

// Configuración del router
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppProviders />,
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
