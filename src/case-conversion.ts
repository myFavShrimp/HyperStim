export function toCamelCase(parts: string[]): string {
    return parts
        .map((part, idx) =>
            idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("");
}

export function toSnakeCase(parts: string[]): string {
    return parts.join("_");
}

export function toPascalCase(parts: string[]): string {
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

export function toKebabCase(parts: string[]): string {
    return parts.join("-");
}

export type Casing = "camel" | "snake" | "pascal" | "kebab";

export function toCase(parts: string[], casing?: Casing | string): string {
    switch (casing) {
        case "camel":
            return toCamelCase(parts);
        case "snake":
            return toSnakeCase(parts);
        case "pascal": {
            return toPascalCase(parts);
        }
        default: {
            return toKebabCase(parts);
        }
    }
}
