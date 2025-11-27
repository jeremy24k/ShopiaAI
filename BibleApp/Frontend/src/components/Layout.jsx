import Sidebar from "./Sidebar";
import Footer from "./Footer";

function Layout({ children }) {
    return (
        <div className="container">
            <aside><Sidebar/></aside>
            <main>{children}</main>
            <footer><Footer/></footer>
        </div>
    );
}

export default Layout;
