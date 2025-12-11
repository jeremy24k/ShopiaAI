import Sidebar from "./Sidebar/Sidebar";

function Layout({ children }) {
    return (
        <div className="container">
            <aside><Sidebar/></aside>
            <main>
                {children}
            </main>
        </div>
    );
}

export default Layout;
