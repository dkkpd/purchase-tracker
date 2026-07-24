import { useState } from "react";
import { register } from "../lib/api"
import type { RegisterRequest } from "../lib/api";
import axios from "axios";

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
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data as string);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    }

    return (

        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit">Register</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>Registered successfully!</p>}
        </form>
    );

}

export default RegisterForm;

