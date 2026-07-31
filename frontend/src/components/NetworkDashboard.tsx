import { useState, useEffect } from "react";
import { createNetwork, joinNetwork, getMyNetworks } from "../lib/api";
import type { NetworkResponse } from "../lib/api";
import { getErrorMessage } from "../lib/errors";

interface NetworkDashboardProps {
    onSelectNetwork: (networkId: number) => void;
}

function NetworkDashboard({onSelectNetwork}: NetworkDashboardProps) {

const [networks, setNetworks] = useState<NetworkResponse[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [newNetworkName, setNewNetworkName] = useState("");
const [inviteCodeInput, setInviteCodeInput] = useState("");

async function loadNetworks() {
    try {
        const data = await getMyNetworks();
        setNetworks(data);
    } catch (error){
        console.error("Failed to load networks:", error);
        setError("Could not load your networks.");
    } finally {
        setLoading(false);
    }
}

useEffect (() => {loadNetworks();}, [])

async function handleCreate(event: React.SubmitEvent) {

    event.preventDefault();
    setError(null);

    try {
        await createNetwork({name: newNetworkName});
        setNewNetworkName("");
        await loadNetworks();
    } catch (error) {
        console.error("Failed to create network:", error);
        handleApiError(error);
    }
}

async function handleJoin(event: React.SubmitEvent) {
    
    event.preventDefault();
    setError(null);

    try {
        await joinNetwork({inviteCode: inviteCodeInput})
        setInviteCodeInput("");
        await loadNetworks();
    } catch (error) {
        console.error("Failed to join network:", error);
        handleApiError(error);
    }
}

function handleApiError(error: unknown) {
    setError(getErrorMessage(error, "Something went wrong"));
}

if (loading) {
    return <p>Loading your networks...</p>;
}


return (
    <div>
        <h2>Your Networks</h2>

        {networks.length === 0 ? (
            <p>You're not in any networks yet.</p>
        ) : (
            <ul>
                {networks.map((network) => (
                    <li key={network.id}>
                        <button onClick={() => onSelectNetwork(network.id)}>{network.name}</button>
                        {" "} — invite code: <strong>{network.inviteCode}</strong>
                    </li>
                ))}
            </ul>
        )}

        {error && <p style={{color:"red"}}>{error}</p>}

        <form onSubmit={handleCreate}>
            <h3>Create a Network</h3>
            <input
                type = "text"
                placeholder="Network Name"
                value = {newNetworkName}
                onChange={(e) => setNewNetworkName(e.target.value)}
            />
            <button type="submit">Create Network</button>
        </form>

        <form onSubmit={handleJoin}>
            <h3>Join a Network</h3>
            <input
                type = "text"
                placeholder="Invite Code"
                value = {inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
            />
            <button type="submit">Join Network</button>
        </form>
    </div>
);
}

export default NetworkDashboard;