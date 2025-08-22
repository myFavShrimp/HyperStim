import { parseMode, patchElements, resolveTarget } from "./dom.ts";
import { buildHyperStimEvaluationFn } from "./hyperstim.ts";
import { patchSignals, SignalsPatchData } from "./signals.ts";

type HtmlPatchCommandData = {
    html: string;
    patchTarget: string;
    patchMode: string;
};
type JsExecutionCommandData = {
    code: string;
};

export type ServerCommand =
    | { type: "hs-patch-signals" } & SignalsPatchData
    | { type: "hs-patch-html" } & HtmlPatchCommandData
    | { type: "hs-execute" } & JsExecutionCommandData;

export type UnknownServerCommand = {
    type: string;
} & Record<string, unknown>;

export type AnyServerCommand = ServerCommand | UnknownServerCommand;
export type UnknownCommandHandler = (data: UnknownServerCommand) => void;

function isKnownCommand(command: AnyServerCommand): command is ServerCommand {
    return command.type === "hs-patch-signals" || command.type === "hs-patch-html" ||
        command.type === "hs-execute";
}

export function processCommand(
    command: AnyServerCommand,
    onOther?: UnknownCommandHandler,
) {
    if (!isKnownCommand(command)) {
        onOther?.(command);
        return;
    }

    switch (command.type) {
        case "hs-patch-html": {
            const patchTarget = command.patchTarget;

            if (!patchTarget) {
                console.error(
                    "HyperStim ERROR: received hs-patch-html command but no patchTarget was specified",
                );
                return;
            }

            const targetElement = resolveTarget(
                patchTarget,
            );
            const patchMode = parseMode(
                command.patchMode ?? null,
            );
            const html = command.html;

            patchElements(
                html,
                targetElement,
                patchMode,
            );
            break;
        }
        case "hs-patch-signals": {
            const { type: _, ...commandData } = command;

            patchSignals(commandData);
            break;
        }
        case "hs-execute": {
            buildHyperStimEvaluationFn(
                command.code,
                { this: window },
                [],
            )();
            break;
        }
    }
}
