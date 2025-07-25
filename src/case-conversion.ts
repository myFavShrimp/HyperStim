export function toCamelCase(parts: string[]): string {
    return parts
        .map((part, idx) =>
            idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("");
}
