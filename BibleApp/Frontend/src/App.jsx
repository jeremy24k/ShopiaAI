import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { BooksContextProvider } from './context/BooksContext';  
import { VersesNotesContextProvider } from './context/VersesNotesContext';
import { AuthContextProvider } from './context/AuthContext';
import { AiContextProvider } from './context/AiContext';
import { FavoritesContextProvider } from './context/FavoritesContext';
import { NotesContextProvider } from './context/NotesContext';
import { UIcontextProvider } from './context/UIcontext';
import { ReadingContextProvider } from './context/ReadingContext';
import './App.css'
import Home from './components/Home'
import Read from './components/Read'
import Favorites from './components/Favorites'
import Notes from './components/Notes'
import AI from './components/AI'
import RouteError from './components/RouteError'
import Login from './components/Login';
import Layout from './components/Layout';
import ContainerApp from './components/ContainerApp';

// Componente wrapper para los providers
function AppProviders() {
  return (
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
  )
}

// Componente wrapper para rutas con layout
function LayoutWrapper({ children }) {
  return <Layout>{children}</Layout>
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
