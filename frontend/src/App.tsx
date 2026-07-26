import {useState, useEffect} from 'react'
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import { isLoggedIn, clearToken } from "./lib/auth";
import NetworkDashboard from './components/NetworkDashboard';
import { getMe } from './lib/api';

function App() {

  const [health, setHealth] = useState("checking...");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [userName, setUserName] = useState<string | null> (null);
  const [email, setEmail] = useState<string | null> (null);

  //health
  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((response) => response.json())
      .then((data) => setHealth(data.status))
      .catch((error) => {
        console.error("Error fetching health status:", error)
        setHealth(error.message)
      })
  }, [])

  useEffect(() => {
    if (!loggedIn) {
      setUserName(null);
      setEmail(null);
      return;
    }

    getMe()
      .then((me) => {
        setUserName(me.name);
        setEmail(me.email);
      })
      .catch((error) => {
        console.error("Failed to load current user:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      });
  }, [loggedIn]);

  function handleLogout() {
    clearToken();
    setUserName(null);
    setEmail(null);
    setLoggedIn(false);
  }

  return (
    <div>
      <h1>Purchase Tracker</h1>
      <p>Health Status: {health}</p>
        {loggedIn ? ( // condition ? ifTrue : ifFalse
            <>
                <p>Signed in as {userName ?? "..."} ({email ?? "..."})</p>
                <button type="button" onClick={handleLogout}>Logout</button>
                <NetworkDashboard />
            </>
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