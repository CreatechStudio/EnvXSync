import {Tabs, TabsProps} from "@heroui/tabs";
import {ReactNode, useEffect, useState} from "react";
import {setSearchParams} from "@/utils/network";

interface SelectableTabsProps extends Omit<TabsProps, 'selectedKey' | 'onSelectionChange'> {
    children: ReactNode | ReactNode[];
    defaultTab?: string;
    reloadOnChange?: boolean;
    paramKey?: string;
}

export default function SelectableTabs({
    children,
    defaultTab,
    className,
    reloadOnChange,
    paramKey = "tab",
    ...props
} : SelectableTabsProps) {
    const [selectedTab, setSelectedTab] = useState<string>(defaultTab || "");

    function toTab(k: string | number) {
        const search = new URLSearchParams(window.location.search);
        search.set(paramKey, k.toString());
        setSearchParams(search, reloadOnChange);
        setSelectedTab(k.toString());
    }

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        const tab = search.get(paramKey);
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
    icon,
    className
} : {
    title: string,
    icon?: ReactNode,
    className?: string
}) {
    return (
        <div className="flex items-center space-x-2">
            {icon}
            <h3 className={className || "font-bold text-medium lg:text-lg"}>{title}</h3>
        </div>
    );
}
