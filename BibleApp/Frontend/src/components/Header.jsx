import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Header() {
    const { logout, isAuthenticated } = useContext(AuthContext);

    return (
        <>
            <h1>Bible App</h1>
            {isAuthenticated && <button onClick={logout}>Logout</button>}
        </>
    );
}

export default Header;
