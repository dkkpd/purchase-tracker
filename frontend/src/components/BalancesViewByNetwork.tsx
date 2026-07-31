import type { BalanceResponse, MemberResponse } from "../lib/api";
import { CheckIcon } from "./icons";
import styles from "./BalancesViewByNetwork.module.css";

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
        return (
            <div className="pt-stack-sm">
                <h3>Balances in This Network</h3>
                <div className="pt-settled-banner">
                    <span className="pt-settled-icon"><CheckIcon /></span>
                    <p className="pt-settled-text">{"You're all settled up in this network."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-stack-sm">
            <h3>Balances in This Network</h3>
            <ul className="pt-list">
                {myBalances.map((balance) => (
                    <li key={`${balance.owedBy}-${balance.owedTo}`} className={styles.balanceRow}>
                        {balance.owedBy === currentUserId
                            ? <span className="pt-text-danger">You owe {nameFor(balance.owedTo)} ${balance.amount.toFixed(2)}</span>
                            : <span className="pt-text-success">{nameFor(balance.owedBy)} owes you ${balance.amount.toFixed(2)}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BalancesViewByNetwork;
