"use client";

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {Alert} from "@heroui/alert";
import {Button} from "@heroui/button";
import {LuPencil, LuPlus, LuRotateCw} from "react-icons/lu";
import LoadingIcon from "@/components/LoadingIcon";
import {Agent} from "../../../../../lib/types/agent";
import {getAgentById} from "@/utils/agent";
import OSIcon from "@/components/OSIcon";
import {AgentStatusChip} from "@/components/AgentCard";
import {Tooltip} from "@heroui/tooltip";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {User} from "../../../../../lib/types/user";
import {getUserById} from "@/utils/user";
import {Card, CardBody} from "@heroui/card";
import {getRelativeTime} from "@/utils/time";
import AgentTasksTable from "@/components/AgentTasksTable";

export function AgentDisplay({
    agent
} : {
    agent: Agent
}) {
    const t = useI18n();
    const [creator, setCreator] = useState<User | null>(null);
    const locale = useCurrentLocale();
    const [agentTasks, setAgentTasks] = useState([]);

    useEffect(() => {
        getUserById(agent.creatorID).then((user) => {
            setCreator(user);
        });
    }, []);

    return (
        <div className="flex flex-col gap-6 lg:gap-12">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                    <div>
                        <OSIcon os={agent.os} size={20}/>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold">
                        {agent.name}
                    </p>
                </div>
                <div>
                    <AgentStatusChip status={agent.status}/>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <div className="w-full flex flex-row items-center justify-between">
                    <h3 className="font-bold text-xl">{t('Agent Details')}</h3>
                    <Button
                        aria-label={t('Edit Agent')}
                        color="primary"
                        startContent={<LuPencil size={18}/>}
                        className="hidden lg:inline-flex"
                    >
                        {t('Edit Agent')}
                    </Button>
                    <Tooltip
                        content={t('Edit Agent')}
                        placement="bottom"
                    >
                        <Button
                            aria-label={t('Edit Agent')}
                            color="primary"
                            isIconOnly
                            size="md"
                            className="inline-flex lg:hidden"
                        >
                            <LuPencil size={18}/>
                        </Button>
                    </Tooltip>
                </div>
                <div>
                    <Card>
                        <CardBody>
                            <div className="grid grid-cols-1 lg:grid-cols-2 p-3 gap-y-3 lg:gap-x-12 w-full">
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Creator')}</p>
                                    <p>{creator ? creator.name : agent.creatorID}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Created At')}</p>
                                    <p>{getRelativeTime(agent.createdAt, locale)}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('OS')}</p>
                                    <p>{agent.os}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Arch')}</p>
                                    <p>{agent.arch}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Version')}</p>
                                    <p>{agent.version}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Last Seen')}</p>
                                    <p>{getRelativeTime(agent.lastSeen, locale)}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-sm text-default-500">{t('Last Update')}</p>
                                    <p>{getRelativeTime(agent.updatedAt, locale)}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="w-full flex flex-row items-center justify-between">
                    <h3 className="font-bold text-xl">{t('Agent Tasks')}</h3>
                    <Button
                        aria-label={t('New Agent Task')}
                        color="primary"
                        startContent={<LuPlus size={20}/>}
                        className="hidden lg:inline-flex"
                    >
                        {t('New Agent Task')}
                    </Button>
                    <Tooltip
                        content={t('New Agent Task')}
                        placement="bottom"
                    >
                        <Button
                            aria-label={t('New Agent Task')}
                            color="primary"
                            isIconOnly
                            size="md"
                            className="inline-flex lg:hidden"
                        >
                            <LuPlus size={20}/>
                        </Button>
                    </Tooltip>
                </div>
                <AgentTasksTable agentTasks={agentTasks}/>
            </div>
        </div>
    );
}

export default function AgentDetailPage() {
    const { agentID } = useParams<{ agentID: string }>();

    const [agent, setAgent] = useState<Agent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching project data
        setTimeout(() => {
            const agentData = getAgentById(agentID);
            if (agentData) {
                setAgent(agentData);
            } else {
                setError("Project not found");
            }
        }, 1000);
    }, []);

    return (
        <div className="w-full h-full">
            {
                agent ? (
                    <AgentDisplay agent={agent}/>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        {
                            error ? (
                                <Alert
                                    title={error}
                                    color="danger"
                                    className="max-w-md"
                                    variant="faded"
                                    endContent={
                                        <Button
                                            color="danger"
                                            variant="light"
                                            isIconOnly
                                            onPress={() => {window.location.reload()}}
                                        >
                                            <LuRotateCw size={20}/>
                                        </Button>
                                    }
                                />
                            ) : (
                                <LoadingIcon className="w-10 h-10 mx-auto"/>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}
