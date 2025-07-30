export function extractModifier(
    modifiers: string[],
    modifierName: string,
): string[] | null {
    const caseModifierIndex = modifiers.findIndex((m) =>
        m === modifierName || m.startsWith(`${modifierName}.`)
    );

    return caseModifierIndex > -1
        ? modifiers.splice(caseModifierIndex, 1)[0]!.split(".")
        : null;
}
