export const getSafeHttpUrl = (
    value?: string | null,
): string | null => {
    const candidate = value?.trim();

    if (!candidate) return null;

    try {
        const url = new URL(candidate);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
};