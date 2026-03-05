import Sidebar from "./Sidebar/Sidebar";
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
    const location = useLocation();
    const path = location.pathname;
    const aiPath = path.includes('/ai');
    const formattedPath = aiPath ? path.split('/ai')[0] + 'ai' : path;
    console.log(path);
    return (
        <div className="container">
            <aside><Sidebar/></aside>
            <main className={aiPath ? formattedPath : 'main'}>
                {children}
            </main>
        </div>
    );
}

export default Layout;
