import {useState, useEffect} from 'react'
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import { isLoggedIn } from "./lib/auth";

function App() {

  const [health, setHealth] = useState("checking...");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((response) => response.json())
      .then((data) => setHealth(data.status))
      .catch((error) => {
        console.error("Error fetching health status:", error)
        setHealth(error.message)
      })
  }, [])

  return (
    <div>
      <h1>Purchase Tracker</h1>
      <p>Health Status: {health}</p>
        {loggedIn ? ( // condition ? ifTrue : ifFalse
            <p>You're logged in!</p>
        ): (
            <>
                <RegisterForm />
                <LoginForm onLoginSuccess={() => setLoggedIn(true)} />
            </>
        )}
    </div>
  );
}

export default App