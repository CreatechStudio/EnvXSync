"use client";

import {useState} from "react";
import {Project} from "../../../../lib/types/project";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {LuClock2, LuPlus} from "react-icons/lu";
import {Tooltip} from "@heroui/tooltip";
import {getRelativeTime} from "@/utils/time";
import {useCurrentLocale, useI18n} from "@/locale/client";
import { LuPencil } from "react-icons/lu";
import {getProjects} from "@/utils/project";

export default function ProjectPage() {
    const locale = useCurrentLocale();
    const t = useI18n();
    const [projects, setProjects] = useState<Project[]>(getProjects());

    function handleEditProject(projectID: string) {
        window.location.href = `/project/${projectID}`;
    }

    return (
        <div className="flex flex-col gap-6 lg:gap-12">
            <div className="flex flex-row items-center justify-between">
                <h1 className="font-bold text-2xl lg:text-3xl">{t('Projects')}</h1>
                <Button
                    aria-label={t('New Project')}
                    color="primary"
                    startContent={<LuPlus size={20}/>}
                    className="hidden lg:inline-flex"
                >
                    {t('New Project')}
                </Button>
                <Tooltip
                    content={t('New Project')}
                    placement="bottom"
                >
                    <Button
                        aria-label={t('New Project')}
                        color="primary"
                        isIconOnly
                        className="inline-flex lg:hidden"
                    >
                        <LuPlus size={25}/>
                    </Button>
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
                {projects.map((project) => (
                    <Card className="p-3" key={project.id}>
                        <CardHeader>
                            <div className="flex flex-col w-full gap-2">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <h3 className="font-bold text-large">{project.name}</h3>
                                    <Button
                                        variant="flat"
                                        size="sm"
                                        isIconOnly
                                        onPress={() => handleEditProject(project.id)}
                                    >
                                        <LuPencil/>
                                    </Button>
                                </div>
                                <p className="text-default-500 text-sm">{project.description}</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-row items-center justify-start gap-2">
                                <LuClock2 className="text-default-500"/>
                                <p className="text-default-500 text-sm">{t('Last Update')}{t(':')}{
                                    getRelativeTime(project.updatedAt, locale)
                                }</p>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
