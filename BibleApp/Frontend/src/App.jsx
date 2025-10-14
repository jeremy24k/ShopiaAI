import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BooksContextProvider } from './context/BooksContext';  
import { NotesContextProvider } from './context/NotesContext';
import './App.css'
import Home from './components/Home'
import Read from './components/Read'
import Favorites from './components/Favorites'
import Notes from './components/Notes'
import AI from './components/AI'
import RouteError from './components/RouteError'
import Login from './components/Login';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <BooksContextProvider>
        <NotesContextProvider>
          <Routes>
            {/* Rutas con layout principal */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/books/*" element={
              <Layout>
                <Read />
              </Layout>
            } />
            <Route path="/favorites" element={
              <Layout>
                <Favorites />
              </Layout>
            } />
            <Route path="/notes" element={
              <Layout>
                <Notes />
              </Layout>
            } />
            <Route path="/ai" element={
              <Layout>
                <AI />
              </Layout>
            } />
            
            {/* Ruta de login sin layout */}
            <Route path="/login" element={<Login />} />
            
            {/* Ruta de error */}
            <Route path="*" element={<RouteError />} />
          </Routes>
        </NotesContextProvider>
      </BooksContextProvider>
    </BrowserRouter>
  )
}

export default App
