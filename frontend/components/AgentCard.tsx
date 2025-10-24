import {Card, CardBody, CardHeader} from "@heroui/card";
import {Chip} from "@heroui/chip";
import {Button} from "@heroui/button";
import {LuClock2, LuGlobe, LuTrash2} from "react-icons/lu";
import {getRelativeTime} from "@/utils/time";
import {Agent} from "../../lib/types/agent";
import {useCurrentLocale, useI18n} from "@/locale/client";
import OSIcon from "@/components/OSIcon";
import {useTransitionRouter} from "next-transition-router";

export function AgentStatusChip({
    status,
    size = 'md'
} : {
    status: Agent['status'],
    size?: 'sm' | 'md' | 'lg'
}) {
    const t = useI18n();

    return (
        status === "online" ? (
            <Chip size={size} className="bg-green-600 text-secondary-foreground">{t('Online')}</Chip>
        ) : status === "offline" ? (
            <Chip color="default" size={size}>{t('Offline')}</Chip>
        ) : status === "error" ? (
            <Chip color="danger" size={size}>{t('Error')}</Chip>
        ) : status === "pending" ? (
            <Chip color="secondary" size={size}>{t('Pending')}</Chip>
        ) : null
    );
}

export default function AgentCard({
    agent,
    onDelete,
    showDelete = false
} : {
    agent: Agent,
    onDelete?: () => void,
    showDelete?: boolean
}) {
    const router = useTransitionRouter();

    const t = useI18n();
    const locale = useCurrentLocale();

    function handleDelete() {
        if (onDelete) {
            onDelete();
        }
    }

    function handlePress() {
        router.push(`/agent/${agent.id}`);
    }

    return (
        <Card className="p-3" key={agent.id} isPressable onPress={handlePress}>
            <CardHeader>
                <div className="w-full flex flex-row items-center justify-between">
                    <div className="flex flex-row gap-3 items-center justify-start">
                        <h3 className="font-bold">{agent.name}</h3>
                        <AgentStatusChip status={agent.status}/>
                    </div>
                    {
                        showDelete ? (
                            <Button
                                variant="light"
                                isIconOnly
                                color="danger"
                                size="sm"
                                onPress={handleDelete}
                            >
                                <LuTrash2 size={15}/>
                            </Button>
                        ) : null
                    }
                </div>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col gap-1">
                    {
                        agent.os ? (
                            <div className="flex flex-row items-center gap-2">
                                <div>
                                    <OSIcon os={agent.os} className="text-default-500"/>
                                </div>
                                <p className="text-default-500 text-sm">{t('OS')}{t(':')}{
                                    agent.arch ? (
                                        `${agent.os} - ${agent.arch}`
                                    ) : agent.os
                                }</p>
                            </div>
                        ) : null
                    }
                    <div className="flex flex-row items-center gap-2">
                        <LuClock2 className="text-default-500"/>
                        <p className="text-default-500 text-sm">{t('Last Seen')}{t(':')}{
                            getRelativeTime(agent.lastSeen, locale)
                        }</p>
                    </div>
                    {
                        agent.ipAddress ? (
                            <div className="flex flex-row items-center gap-2">
                                <LuGlobe className="text-default-500"/>
                                <p className="text-default-500 text-sm">IP{t(':')}{agent.ipAddress}</p>
                            </div>
                        ) : null
                    }
                </div>
            </CardBody>
        </Card>
    );
}
