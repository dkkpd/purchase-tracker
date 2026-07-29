import { useState, useEffect } from "react";
import { getNetworkBalances } from "../lib/api";
import type { BalanceResponse } from "../lib/api";

interface BalanceViewByNetworkProps {
    networkId: number
    currentUserId: number
    members: {id: number; name: string}[]
}

function BalancesViewByNetwork({networkId, currentUserId, members}: BalanceViewByNetworkProps) {
    const [balances, setBalances] = useState<BalanceResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNetworkBalances(networkId).then((data) => {
            setBalances(data);
            setLoading(false);
        })
    }, [networkId]);

    function nameFor(userId: number): string {
        return members.find((m) => m.id === userId)?.name ?? `User #${userId}`;
    }

    if (loading) {
        return <p>Loading balances...</p>;
    }

    const myBalances = balances.filter(
        (b) => b.owedBy === currentUserId || b.owedTo === currentUserId
    );

    if (myBalances.length === 0) {
        return <p>You're all settled up in this network.</p>
    }

    return (
        <ul>
            {myBalances.map( (balance) => (
                <li key={`${balance.owedBy}-${balance.owedTo}`}>
                    {balance.owedBy === currentUserId
                        ? `You owe ${nameFor(balance.owedTo)} $${balance.amount.toFixed(2)}`
                        : `${nameFor(balance.owedBy)} owes you $${balance.amount.toFixed(2)}` }
                </li>
            ))}
        </ul>
    );

}

export default BalancesViewByNetwork;