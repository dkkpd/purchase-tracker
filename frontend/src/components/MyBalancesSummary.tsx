import { useState, useEffect } from "react";
import { getMyBalances } from "../lib/api";
import type { MyBalanceResponse } from "../lib/api";

interface MyBalancesSummaryProps {
    currentUserId: number;
}

function MyBalancesSummary({currentUserId}: MyBalancesSummaryProps) {
    const [balances, setBalances] = useState<MyBalanceResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyBalances().then((data) => {
            setBalances(data);
            setLoading(false);
        })
    }, []);

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
                        [{b.networkName}]{""}
                        {b.owedBy === currentUserId
                            ? `You owe user #${b.owedTo} $${b.amount.toFixed(2)}`
                            : `User #${b.owedBy} owes you $${b.amount.toFixed(2)}`}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default MyBalancesSummary;