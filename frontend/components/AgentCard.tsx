import {Card, CardBody, CardHeader} from "@heroui/card";
import {Chip} from "@heroui/chip";
import {Button} from "@heroui/button";
import {LuClock2, LuGlobe, LuTrash2} from "react-icons/lu";
import {getRelativeTime} from "@/utils/time";
import {Agent} from "../../lib/types/agent";
import {useCurrentLocale, useI18n} from "@/locale/client";

export default function AgentCard({agent} : {agent: Agent}) {
    const t = useI18n();
    const locale = useCurrentLocale();

    return (
        <Card className="p-3" key={agent.id}>
            <CardHeader>
                <div className="w-full flex flex-row items-center justify-between">
                    <div className="flex flex-row gap-3">
                        <h3 className="font-bold">{agent.name}</h3>
                        {
                            agent.status === "online" ? (
                                <Chip color="success" size="sm">{t('Online')}</Chip>
                            ) : agent.status === "offline" ? (
                                <Chip color="default" size="sm">{t('Offline')}</Chip>
                            ) : agent.status === "error" ? (
                                <Chip color="danger" size="sm">{t('Error')}</Chip>
                            ) : null
                        }
                    </div>
                    <Button
                        variant="light"
                        isIconOnly
                        color="danger"
                        size="sm"
                    >
                        <LuTrash2 size={15}/>
                    </Button>
                </div>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col gap-1">
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