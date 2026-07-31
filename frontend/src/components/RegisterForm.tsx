import { useState } from "react";
import { register } from "../lib/api"
import type { RegisterRequest } from "../lib/api";
import { getErrorMessage } from "../lib/errors";

function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState ("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        const requestData: RegisterRequest = {name: name, email: email, password: password}

        try {
            await register(requestData);
            setSuccess(true);
            setName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            setError(getErrorMessage(error, "Something went wrong. Please try again."));
        }
    }

    return (

        <form onSubmit={handleSubmit} className="pt-card pt-stack">
            <h2>Register</h2>
            <div className="pt-field">
                <label htmlFor="name" className="pt-label">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pt-input"
                />
            </div>

            <div className="pt-field">
                <label htmlFor="email" className="pt-label">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pt-input"
                />
            </div>

            <div className="pt-field">
                <label htmlFor="password" className="pt-label">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pt-input"
                />
            </div>

            <button type="submit" className="pt-btn pt-btn-primary">Register</button>
            {error && <p className="pt-banner pt-banner-error">{error}</p>}
            {success && <p className="pt-banner pt-banner-success">Registered successfully!</p>}
        </form>
    );

}

export default RegisterForm;

