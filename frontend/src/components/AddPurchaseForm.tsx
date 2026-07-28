import { useState } from "react";
import { createPurchase } from "../lib/api";
import type { PurchaseItemRequest} from "../lib/api";
import axios from "axios";

interface AddPurchaseFormProps {
    networkId: number;
    members: { id: number; name: string }[]
    onPurchaseCreated: () => void
}

function AddPurchaseForm({networkId, members, onPurchaseCreated}: AddPurchaseFormProps) {
    const [description, setDescription] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [items, setItems] = useState<PurchaseItemRequest[]>([{
        description: "", cost: 0, recipientId: members[0]?.id ?? 0}, //use the first member's ID as a sensible default, or 0 if there are somehow no members at all.
    ]);
    const [error, setError] = useState<string | null>(null);

    function updateItem(index: number, updated: Partial<PurchaseItemRequest>) {
        //used Partial request so that updating just one part of a purchase doesn't require pasing the other parts too.
        // for example, updating the cost shouldnt require the description and recipientId every time

        // takes the previous state, and iterates through the previous state until it reaches the item we want to update(indicated by 'index') and then uses object merging with spread syntax.
        // {...item, ...updated} means copy all existing properties from 'item', then overwrite or add properties provided in 'updated'
        setItems((prevState) => prevState.map((item, i) => (i === index ? {...item, ...updated} : item)));
    }

    function addItemRow() {
        setItems((prevState) => [
            ...prevState, {description: "", cost: 0, recipientId: members[0]?.id ?? 0} // same as above on line 16
        ]);
    }

    function removeItemRow(index: number) {
        // keep every item in the list except the one at the given index. works similar to python masking a numpy array
        setItems((prevState) => prevState.filter((_, i) => i !== index));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        try {
            await createPurchase(networkId, {description, purchaseDate, items});
            setDescription("");
            setPurchaseDate("");
            setItems([{description: "", cost: 0, recipientId: members[0]?.id ?? 0}]);
            onPurchaseCreated();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data as string);
            } else {
                setError("Something went wrong creating purchase.")
            }
        }
    }

    return (
        <form onSubmit = {handleSubmit}>

            <h3>Log a Purchase</h3>

            <input
                type = "text"
                placeholder="Description (e.g. Walmart Groceries)"
                value = {description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <input
                type = "date"
                value = {purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
            />

            <h4>Items</h4>
            {items.map((item, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Item description"
                        value = {item.description}
                        onChange = {(e) => updateItem(index, {description: e.target.value})}
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Cost"
                        value={item.cost}
                        onChange={(e) => updateItem(index, {cost: parseFloat(e.target.value)})}
                    />
                    <select
                        value={item.recipientId}
                        onChange = {(e) => updateItem(index, {recipientId: Number(e.target.value) })}
                    >
                        {members.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                    {items.length > 1 && (
                        <button type ="button" onClick={() => removeItemRow(index)}>Remove</button>
                    )}
                </div>
            ))}

            <button type = "button" onClick={() => addItemRow()}>+ Add another item</button>

            <button type = "submit">Save Purchase</button>

            {error && <p style={{color: "red"}}>{error}</p>}

        </form>
    );
}

export default AddPurchaseForm