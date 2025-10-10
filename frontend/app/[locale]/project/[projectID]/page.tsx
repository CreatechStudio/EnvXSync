"use client";

import {useEffect, useState} from "react";
import {Project} from "../../../../../lib/types/project";
import LoadingIcon from "@/components/LoadingIcon";
import {getEnvVarsByIds, getProjectAgents, getProjectById} from "@/utils/project";
import {useParams} from "next/navigation";
import {Alert} from "@heroui/alert";
import {Button} from "@heroui/button";
import {LuPlus, LuRotateCw} from "react-icons/lu";
import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";
import { RxSlash } from "react-icons/rx";
import {User} from "../../../../../lib/types/user";
import {getUserById} from "@/utils/user";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {Tooltip} from "@heroui/tooltip";
import {Agent} from "../../../../../lib/types/agent";
import AgentCard from "@/components/AgentCard";
import EnvEditTable from "@/components/EnvEditTable";

export function ProjectDisplay({
    project,
    setProject
} : {
    project: Project,
    setProject: (project: Project) => void
}) {
    const locale = useCurrentLocale();
    const t = useI18n();
    const [creator, setCreator] = useState<User | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        // Simulate fetching user data
        setTimeout(() => {
            const userData = getUserById(project.creatorID);
            setCreator(userData);
        }, 500);

        setAgents(getProjectAgents(project.id));
    }, [project]);

    return (
        <div className="flex flex-col gap-6 lg:gap-12">
            <Breadcrumbs
                size="lg"
                variant="light"
                separator={
                    <RxSlash/>
                }
            >
                <BreadcrumbItem>
                    {creator ? creator.name : project.creatorID}
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <p className="cursor-pointer text-xl font-bold">
                        {project.name}
                    </p>
                </BreadcrumbItem>
            </Breadcrumbs>

            <div className="flex flex-col gap-6">
                <div className="w-full flex flex-row items-center justify-between">
                    <h3 className="font-bold text-xl">{t('Environment Variables')}</h3>
                    <Button
                        aria-label={t('New Environment Variable')}
                        color="primary"
                        startContent={<LuPlus size={20}/>}
                        className="hidden lg:inline-flex"
                    >
                        {t('New Environment Variable')}
                    </Button>
                    <Tooltip
                        content={t('New Environment Variable')}
                        placement="bottom"
                    >
                        <Button
                            aria-label={t('New Environment Variable')}
                            color="primary"
                            isIconOnly
                            size="sm"
                            className="inline-flex lg:hidden"
                        >
                            <LuPlus size={20}/>
                        </Button>
                    </Tooltip>
                </div>

                <EnvEditTable envVars={getEnvVarsByIds(project.envVarIDs)}/>
            </div>

            <div className="flex flex-col gap-6">
                <div className="w-full flex flex-row items-center justify-between">
                    <h3 className="font-bold text-xl">{t('Agents')}</h3>
                    <Button
                        aria-label={t('Add Agent')}
                        color="primary"
                        startContent={<LuPlus size={20}/>}
                        className="hidden lg:inline-flex"
                    >
                        {t('Add Agent')}
                    </Button>
                    <Tooltip
                        content={t('Add Agent')}
                        placement="bottom"
                    >
                        <Button
                            aria-label={t('Add Agent')}
                            color="primary"
                            isIconOnly
                            size="sm"
                            className="inline-flex lg:hidden"
                        >
                            <LuPlus size={20}/>
                        </Button>
                    </Tooltip>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
                    {agents.map((agent) => (
                        <AgentCard agent={agent} key={agent.id} showDelete/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function ProjectDetailPage() {
    const { projectID } = useParams<{ projectID: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching project data
        setTimeout(() => {
            const projectData = getProjectById(projectID);
            if (projectData) {
                setProject(projectData);
            } else {
                setError("Project not found");
            }
        }, 1000);
    }, []);

    return (
        <div className="w-full h-full">
            {
                project ? (
                    <ProjectDisplay project={project} setProject={setProject}/>
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
