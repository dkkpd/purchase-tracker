import type { BalanceResponse, MemberResponse } from "../lib/api";

interface BalancesViewByNetworkProps {
    balances: BalanceResponse[];
    currentUserId: number;
    members: MemberResponse[];
}

function BalancesViewByNetwork({ balances, currentUserId, members }: BalancesViewByNetworkProps) {
    function nameFor(userId: number): string {
        return members.find((m) => m.id === userId)?.name ?? `User #${userId}`;
    }

    const myBalances = balances.filter(
        (b) => b.owedBy === currentUserId || b.owedTo === currentUserId
    );

    if (myBalances.length === 0) {
        return <p>{"You're all settled up in this network."}</p>;
    }

    return (
        <ul>
            {myBalances.map((balance) => (
                <li key={`${balance.owedBy}-${balance.owedTo}`}>
                    {balance.owedBy === currentUserId
                        ? `You owe ${nameFor(balance.owedTo)} $${balance.amount.toFixed(2)}`
                        : `${nameFor(balance.owedBy)} owes you $${balance.amount.toFixed(2)}`}
                </li>
            ))}
        </ul>
    );
}

export default BalancesViewByNetwork;
