import { useState, useEffect } from "react";
import { getNetworkMembers, getPurchases, deletePurchase, getNetworkBalances } from "../lib/api";
import type { BalanceResponse, MemberResponse, PurchaseResponse } from "../lib/api";
import AddPurchaseForm from "./AddPurchaseForm";
import PurchaseList from "./PurchaseList";
import BalancesViewByNetwork from "./BalancesViewByNetwork";
import SettlementHistory from "./SettlementHistory";
import SettleUpForm from "./SettleUpForm"
import styles from "./NetworkDetailsPage.module.css";

interface NetworkDetailsPageProps {
    networkId: number;
    currentUserId: number;
    onBalancesChanged?: () => void;
}

function NetworkDetailPage({ networkId, currentUserId, onBalancesChanged }: NetworkDetailsPageProps) {
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
    const [balances, setBalances] = useState<BalanceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [settlementRefreshKey, setSettlementRefreshKey] = useState(0);

    async function loadData() {
        const [membersData, purchasesData, balancesData] = await Promise.all([
            getNetworkMembers(networkId),
            getPurchases(networkId),
            getNetworkBalances(networkId),
        ]);
        setMembers(membersData);
        setPurchases(purchasesData);
        setBalances(balancesData);
        setLoading(false);
        await onBalancesChanged?.();
    }

    useEffect(() => {
        loadData();
    }, [networkId]);

    async function handleDelete(purchaseId: number) {
        await deletePurchase(networkId, purchaseId);
        await loadData();
    }

    if (loading) {
        return <p className="pt-text-muted">Loading...</p>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.zone}>
                <div className={styles.group}>
                    <BalancesViewByNetwork
                        balances={balances}
                        currentUserId={currentUserId}
                        members={members}
                    />
                </div>
            </div>

            <div className={styles.zone}>
                <div className={styles.group}>
                    <PurchaseList
                        purchases={purchases}
                        currentUserId={currentUserId}
                        members={members}
                        onDelete={handleDelete}
                    />
                </div>
                <div className={styles.group}>
                    <AddPurchaseForm
                        networkId={networkId}
                        members={members}
                        onPurchaseCreated={loadData}
                    />
                </div>
            </div>

            <div className={styles.zone}>
                <div className={styles.group}>
                    <SettlementHistory
                        networkId={networkId}
                        members={members}
                        refreshKey={settlementRefreshKey}
                    />
                </div>
                <div className={styles.group}>
                    <SettleUpForm
                        networkId={networkId}
                        members={members}
                        onSettled={() => {
                            setSettlementRefreshKey((k) => k + 1);
                            loadData();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default NetworkDetailPage;
