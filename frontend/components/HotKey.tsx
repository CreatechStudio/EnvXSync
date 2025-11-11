import {useHotkeys} from "react-hotkeys-hook";
import {isMac} from "@react-aria/utils";
import {Hotkey} from "react-hotkeys-hook/packages/react-hotkeys-hook/dist/types";
import {Kbd, KbdKey} from "@heroui/kbd";
import {useEffect, useState} from "react";

export default function HotKey({
    command,
    mainKey,
    callback,
    replaceCtrlWithCommand = true,
    className
} : {
    command: KbdKey[],
    mainKey: string,
    callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void,
    replaceCtrlWithCommand?: boolean,
    className?: string
}) {
    const [cmd, setCmd] = useState<KbdKey[]>(command);
    const [recordCmd, setRecordCmd] = useState<string[]>(cmd);

    useHotkeys(`${recordCmd.join('+')}+${mainKey}`, callback);

    useEffect(() => {
        if (replaceCtrlWithCommand && isMac()) {
            setCmd((cmd) => {
                const commandIndex = cmd.indexOf("ctrl");
                if (commandIndex !== -1) {
                    cmd[commandIndex] = "command";
                }
                return [...cmd];
            });
        }
    }, [command]);

    useEffect(() => {
        if (isMac()) {
            const newRecordCmd: string[] = [...cmd];
            const commandIndex = newRecordCmd.indexOf("command");
            if (commandIndex !== -1) {
                newRecordCmd[commandIndex] = "meta";
            }
            setRecordCmd(newRecordCmd);
        }
    }, [cmd]);

    return (
        <Kbd keys={cmd} className={className}>{mainKey.toUpperCase()}</Kbd>
    );
}
