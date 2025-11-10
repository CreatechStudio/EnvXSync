"use client";

import {useEffect, useState} from "react";
import {Project} from "../../../../../lib/types/project";
import LoadingIcon from "@/components/LoadingIcon";
import {getEnvVarsByIds, getProjectAgents, getProjectById} from "@/utils/project";
import {useParams} from "next/navigation";
import {Alert} from "@heroui/alert";
import {Button} from "@heroui/button";
import {LuRotateCw} from "react-icons/lu";
import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";
import { RxSlash } from "react-icons/rx";
import {User} from "../../../../../lib/types/user";
import {getUserById} from "@/utils/user";
import {useI18n} from "@/locale/client";
import {Agent} from "../../../../../lib/types/agent";
import AgentCard from "@/components/AgentCard";
import EnvEditTable from "@/components/EnvEditTable";
import {clearUrlHash} from "@/utils/network";
import {Tab} from "@heroui/tabs";
import SelectableTabs, {TabTitle} from "@/components/SelectableTabs";
import {EnvVar} from "../../../../../lib/types/env_var";
import ProjectSettings from "@/components/ProjectSettings";

export function ProjectDisplay({
    project,
} : {
    project: Project,
}) {
    const t = useI18n();
    const [creator, setCreator] = useState<User | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);

    useEffect(() => {
        getUserById(project.creatorID).then((userData) => {
            setCreator(userData);
        });
        setAgents(getProjectAgents(project.id));
        getEnvVarsByIds(project.envVarIDs).then((vars) => {
            setEnvVars(vars);
        });
    }, [project]);

    return (
        <div className="flex flex-col gap-6 lg:gap-12">
            <div className="flex flex-col gap-3">
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
                        <p className="cursor-pointer text-xl lg:text-2xl font-bold select-none" onClick={() => clearUrlHash(true)}>
                            {project.name}
                        </p>
                    </BreadcrumbItem>
                </Breadcrumbs>
                <p className="hidden md:block text-sm text-gray-600">
                    {project.description || t('This man is lazy, no description here!')}
                </p>
            </div>

            <div className="flex flex-col w-full gap-3 lg:gap-6">
                <SelectableTabs defaultTab="envs">
                    <Tab key="envs" title={<TabTitle title={t('Environment Variables')}/>}>
                        <EnvEditTable envVars={envVars} projectID={project.id}/>
                    </Tab>
                    <Tab key="agents" title={<TabTitle title={t('Agents')}/>}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 w-full">
                            {agents.map((agent) => (
                                <AgentCard agent={agent} key={agent.id} showDelete/>
                            ))}
                        </div>
                        {agents.length === 0 && (
                            <div className="w-full flex flex-col items-center justify-center">
                                <Alert
                                    title="No Agents Found"
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
                            </div>
                        )}
                    </Tab>
                    <Tab key="settings" title={<TabTitle title={t("Settings")}/>}>
                        <ProjectSettings project={project}/>
                    </Tab>
                </SelectableTabs>
            </div>
        </div>
    )
}

export default function ProjectDetailPage() {
    const { projectID } = useParams<{ projectID: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProjectById(projectID).then((projectData) => {
            if (projectData) {
                setProject(projectData);
            }
        });
    }, []);

    return (
        <div className="w-full h-full">
            {
                project ? (
                    <ProjectDisplay project={project}/>
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
