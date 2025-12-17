import FavoriteVerses from "../features/favorites/FavoriteVerses";
import { Link } from "react-router-dom";

function Favorites() {
    return (
        <div>
            <h1>Favorites</h1>
            <FavoriteVerses />
            <Link to="/books">Go to Verses</Link>
        </div>
    );
}

export default Favorites;   