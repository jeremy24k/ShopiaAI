import Sidebar from "./Sidebar/Sidebar";
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
    const location = useLocation();
    const path = location.pathname;
    const formattedPath = location.pathname.replace('/', '');
    console.log(formattedPath);
    return (
        <div className="container">
            <aside><Sidebar/></aside>
            <main className={path == '/ai' ? formattedPath : ''}>
                {children}
            </main>
        </div>
    );
}

export default Layout;
