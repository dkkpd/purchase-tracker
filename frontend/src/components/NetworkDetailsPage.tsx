import { useState, useEffect } from "react";
import { getNetworkMembers, getPurchases, deletePurchase } from "../lib/api";
import type { MemberResponse, PurchaseResponse } from "../lib/api";
import AddPurchaseForm from "./AddPurchaseForm";
import PurchaseList from "./PurchaseList";
import BalancesViewByNetwork from "./BalancesViewByNetwork";

//this component must receive the networkId and currentUserId
interface NetworkDetailsPageProps {
    networkId: number
    currentUserId: number
}

function NetworkDetailPage({networkId, currentUserId}: NetworkDetailsPageProps) {
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        const [membersData, purchasesData] = await Promise.all([
            getNetworkMembers(networkId),
            getPurchases(networkId),
        ]);
        setMembers(membersData);
        setPurchases(purchasesData);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [networkId]); // rerun this effect every time the networkId changes on a subsequence render

    async function handleDelete(purchaseId: number) {
        await deletePurchase(networkId, purchaseId);
        await loadData();
    }

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <PurchaseList // gets current purchases, who's logged in (so we know whether they can delete it or not), and what to do when delete is clicked.
                purchases = {purchases}
                currentUserId = {currentUserId}
                members={members}
                onDelete = {handleDelete}
            />
            <AddPurchaseForm
                networkId={networkId}
                members={members}
                onPurchaseCreated={loadData}
            />
            <BalancesViewByNetwork
                networkId = {networkId}
                currentUserId = {currentUserId}
                members = {members}
            />
        </div>
    );
}

export default NetworkDetailPage;
