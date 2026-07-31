import type { MyBalanceResponse } from "../lib/api";
import styles from "./MyBalancesSummary.module.css";

interface MyBalancesSummaryProps {
    currentUserId: number;
    balances: MyBalanceResponse[];
    loading: boolean;
}

function MyBalancesSummary({ currentUserId, balances, loading }: MyBalancesSummaryProps) {
    if (loading) {
        return <p className="pt-text-muted">Loading your balances...</p>;
    }

    if (balances.length === 0) {
        return <p className="pt-text-muted">You're all settled across all networks!</p>;
    }

    return (
        <div className="pt-stack">
            <h3>Your Balances Across All Networks</h3>
            <ul className="pt-list">
                {balances.map((b) => (
                    <li key={`${b.networkId}-${b.owedBy}-${b.owedTo}`} className={styles.balanceRow}>
                        <span className={styles.networkTag}>[{b.networkName}]</span>{" "}
                        {b.owedBy === currentUserId
                            ? <span className="pt-text-danger">You owe {b.owedToName} ${b.amount.toFixed(2)}</span>
                            : <span className="pt-text-success">{b.owedByName} owes you ${b.amount.toFixed(2)}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MyBalancesSummary;
