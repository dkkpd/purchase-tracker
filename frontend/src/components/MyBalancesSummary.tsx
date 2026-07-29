import type { MyBalanceResponse } from "../lib/api";

interface MyBalancesSummaryProps {
    currentUserId: number;
    balances: MyBalanceResponse[];
    loading: boolean;
}

function MyBalancesSummary({ currentUserId, balances, loading }: MyBalancesSummaryProps) {
    if (loading) {
        return <p>Loading your balances...</p>;
    }

    if (balances.length === 0) {
        return <p>You're all settled across all networks!</p>;
    }

    return (
        <div>
            <h3>Your Balances Across All Networks</h3>
            <ul>
                {balances.map((b) => (
                    <li key={`${b.networkId}-${b.owedBy}-${b.owedTo}`}>
                        [{b.networkName}]{" "}
                        {b.owedBy === currentUserId
                            ? `You owe ${b.owedToName} $${b.amount.toFixed(2)}`
                            : `${b.owedByName} owes you $${b.amount.toFixed(2)}`}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MyBalancesSummary;
