import { useState, useEffect } from "react";
import { getNetworkMembers, getPurchases, deletePurchase, getNetworkBalances } from "../lib/api";
import type { BalanceResponse, MemberResponse, PurchaseResponse } from "../lib/api";
import AddPurchaseForm from "./AddPurchaseForm";
import PurchaseList from "./PurchaseList";
import BalancesViewByNetwork from "./BalancesViewByNetwork";

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
        onBalancesChanged?.();
    }

    useEffect(() => {
        loadData();
    }, [networkId]);

    async function handleDelete(purchaseId: number) {
        await deletePurchase(networkId, purchaseId);
        await loadData();
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <PurchaseList
                purchases={purchases}
                currentUserId={currentUserId}
                members={members}
                onDelete={handleDelete}
            />
            <AddPurchaseForm
                networkId={networkId}
                members={members}
                onPurchaseCreated={loadData}
            />
            <BalancesViewByNetwork
                balances={balances}
                currentUserId={currentUserId}
                members={members}
            />
        </div>
    );
}

export default NetworkDetailPage;
