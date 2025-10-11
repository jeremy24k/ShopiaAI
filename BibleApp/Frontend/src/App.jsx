import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Read from './components/Read'
import Favorites from './components/Favorites'
import Notes from './components/Notes'
import AI from './components/AI'
import Footer from './components/Footer'
import RouteError from './components/RouteError'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BooksContextProvider } from './context/BooksContext';
import { NotesContextProvider } from './context/NotesContext';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <header>
          <Header/>
        </header>
        <aside>
          <Sidebar/>
        </aside>
        <main>
          {/* Wrap routes with context provider for books data */}
          <BooksContextProvider>
            <NotesContextProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books/*" element={<Read />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/ai" element={<AI />} />
                <Route path="*" element={<RouteError />} />
              </Routes>
            </NotesContextProvider>
          </BooksContextProvider>
        </main>
        <footer>
          <Footer/>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
