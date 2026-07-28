import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        if (typeof data === "string") {
            return data;
        }
        if (data && typeof data === "object") {
            return Object.values(data as Record<string, string>).join(". ");
        }
    }
    return fallback;
}
