import {useState, useEffect} from 'react'
import styles from "./App.module.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import { isLoggedIn, clearToken } from "./lib/auth";
import NetworkDashboard from "./components/NetworkDashboard";
import NetworkDetailPage from "./components/NetworkDetailsPage";
import MyBalanceSummary from "./components/MyBalancesSummary";
import { getMe, getMyBalances } from "./lib/api";
import type { MyBalanceResponse } from "./lib/api";

function App() {

  const [health, setHealth] = useState("checking...");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myBalances, setMyBalances] = useState<MyBalanceResponse[]>([]);
  const [myBalancesLoading, setMyBalancesLoading] = useState(false);

  //health
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
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
      setCurrentUserId(null);
      return;
    }

    getMe()
      .then((me) => {
        setUserName(me.name);
        setEmail(me.email);
        setCurrentUserId(me.id);
      })
      .catch((error) => {
        console.error("Failed to load current user:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      });
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn && currentUserId !== null) {
      loadMyBalances();
    } else {
      setMyBalances([]);
    }
  }, [loggedIn, currentUserId]);
  async function loadMyBalances() {
    setMyBalancesLoading(true);
    try {
      const data = await getMyBalances();
      setMyBalances(data);
    } finally {
      setMyBalancesLoading(false);
    }
  }


  function handleLogout() {
    clearToken();
    setUserName(null);
    setEmail(null);
    setCurrentUserId(null);
    setLoggedIn(false);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1>Purchase Tracker</h1>
          <p className={styles.health}>Health Status: {health}</p>
        </div>
        {loggedIn && (
          <div className={styles.userInfo}>
            <p className={styles.userText}>Signed in as {userName ?? "..."} ({email ?? "..."})</p>
            <button type="button" className="pt-btn pt-btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {loggedIn ? (
          <>
            {selectedNetworkId === null ? (
              <div className="pt-stack">
                <MyBalanceSummary
                  currentUserId={currentUserId ?? 0}
                  balances={myBalances}
                  loading={myBalancesLoading}
                />
                <NetworkDashboard onSelectNetwork={setSelectedNetworkId} />
              </div>
            ) : (
              <div className="pt-stack">
                <button type="button" className="pt-btn pt-btn-ghost" onClick={() => setSelectedNetworkId(null)}>
                  &larr; Back to networks
                </button>
                <NetworkDetailPage
                  networkId={selectedNetworkId}
                  currentUserId={currentUserId ?? 0}
                  onBalancesChanged={loadMyBalances}
                />
              </div>
            )}
          </>
        ) : (
          <div className={styles.authSection}>
            <RegisterForm />
            <LoginForm onLoginSuccess={() => setLoggedIn(true)} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App
