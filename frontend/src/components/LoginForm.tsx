import {useState} from "react";
import {login} from "../lib/api";
import type {LoginRequest} from "../lib/api";
import {saveToken} from "../lib/auth";
import axios from "axios";

interface LoginFormProps {
    onLoginSuccess: () => void;
}

function LoginForm({onLoginSuccess}: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        setError(null)

        const requestData: LoginRequest = {email: email, password: password};

        try {
            const response = await login(requestData);
            saveToken(response.token);
            setEmail("")
            setPassword("")
            onLoginSuccess();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data as string);
            } else {
                setError("Something went wrong. Please try again.")
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>

            <h2>Login</h2>

            <div>
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit">Login</button>

            {error && <p style={{color: "red"}}>{error}</p>}
        </form>
    );
}

export default LoginForm;