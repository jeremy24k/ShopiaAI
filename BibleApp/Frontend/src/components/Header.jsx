import supabase from "../supabase/supabase";

function Header() {
    return (
        <>
            <h1>Bible App</h1>
            <button onClick={() => supabase.auth.signOut()}>Logout</button>
        </>
    );
}

export default Header;
