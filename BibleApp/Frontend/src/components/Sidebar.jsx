
import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <ul>
            <li>
                <Link to="/">🏠 Home</Link>
            </li>
            <li>
                <Link to="/books">📖 Read</Link>
            </li>
            <li>
                <Link to="/favorites">⭐ Favorites</Link>
            </li>
            <li>
                <Link to="/notes">📝 Notes</Link>
            </li>
            <li>
                <Link to="/ai">🤖 AI</Link>
            </li>
        </ul>
    );
}

export default Sidebar;