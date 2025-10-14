import DailyVerse from "./DailyVerse";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import supabase from "../supabase/supabase";

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
          if (!session) {
            navigate('/login');
          } else {
            navigate('/');
          }
        });
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <DailyVerse />
        </div>
    );
}

export default Home;