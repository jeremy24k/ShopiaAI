import supabase from "../supabase/supabase";
import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");


    const HandleEmailChange = (email) => {
        setEmail(email);
    }

    const HandlePasswordChange = (password) => {
        setPassword(password);
    }

    const HandleNameChange = (name) => {
        setName(name);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log('Login response:', data);
        console.log('Login error:', error);
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                },
                emailRedirectTo: 'http://localhost:5173',
            },
        });

        console.log('SignUp response:', data);
        console.log('SignUp error:', error);
    }
    
    return (
        <div className="login">
            <form>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => HandleEmailChange(e.target.value)}
                />
                <input 
                    type="text"
                    placeholder="Name" 
                    value={name}
                    onChange={(e) => HandleNameChange(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => HandlePasswordChange(e.target.value)}
                />
                <button type="button" onClick={handleLogin}>Login</button>
                <button type="button" onClick={handleSignUp}>Sign Up</button>
            </form>
        </div>
    );
}

export default Login;
