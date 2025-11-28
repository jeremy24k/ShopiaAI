import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <div className="container">
            <aside><Sidebar/></aside>
            <main>{children}</main>
        </div>
    );
}

export default Layout;
