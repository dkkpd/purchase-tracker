import {useState} from "react";
import {login} from "../lib/api";
import type {LoginRequest} from "../lib/api";
import {saveToken} from "../lib/auth";
import { getErrorMessage } from "../lib/errors";

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
            setError(getErrorMessage(error, "Something went wrong. Please try again."));
        }
    }

    return (
        <form onSubmit={handleSubmit} className="pt-card pt-stack">

            <h2>Login</h2>

            <div className="pt-field">
                <label htmlFor="login-email" className="pt-label">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pt-input"
                />
            </div>

            <div className="pt-field">
                <label htmlFor="login-password" className="pt-label">Password</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pt-input"
                />
            </div>

            <button type="submit" className="pt-btn pt-btn-primary">Login</button>

            {error && <p className="pt-banner pt-banner-error">{error}</p>}
        </form>
    );
}

export default LoginForm;