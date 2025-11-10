import {Tabs, TabsProps} from "@heroui/tabs";
import {ReactNode, useEffect, useState} from "react";
import {setSearchParams} from "@/utils/network";

interface SelectableTabsProps extends Omit<TabsProps, 'selectedKey' | 'onSelectionChange'> {
    children: ReactNode[];
    defaultTab?: string;
    reloadOnChange?: boolean
}

export default function SelectableTabs({
    children,
    defaultTab,
    className,
    reloadOnChange,
    ...props
} : SelectableTabsProps) {
    const [selectedTab, setSelectedTab] = useState<string>(defaultTab || "");

    function toTab(k: string | number) {
        const search = new URLSearchParams(window.location.search);
        search.set("tab", k.toString());
        setSearchParams(search, reloadOnChange);
        setSelectedTab(k.toString());
    }

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        const tab = search.get("tab");
        if (tab) {
            setSelectedTab(tab);
        }
    }, []);

    return (
        <Tabs
            selectedKey={selectedTab}
            onSelectionChange={toTab}
            className={className}
            variant="underlined"
            {...props}
        >
            {children}
        </Tabs>
    );
}

export function TabTitle({
    title,
    icon
} : {
    title: string,
    icon?: ReactNode
}) {
    return (
        <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-bold text-medium lg:text-lg">{title}</h3>
        </div>
    );
}
