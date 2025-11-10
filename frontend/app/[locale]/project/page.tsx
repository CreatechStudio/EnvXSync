"use client";

import {useEffect, useState} from "react";
import {Project} from "../../../../lib/types/project";
import {Button} from "@heroui/button";
import {LuPlus} from "react-icons/lu";
import {Tooltip} from "@heroui/tooltip";
import {useI18n} from "@/locale/client";
import {getProjects} from "@/utils/project";
import ProjectCard from "@/components/ProjectCard";
import useNewProjectModal from "@/components/modals/NewProjectModal";

export default function ProjectPage() {
    const t = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [setNewProjectModalOpen, NewProjectModal] = useNewProjectModal();

    useEffect(() => {
        getProjects().then((p) => {
            setProjects(p);
        });
    }, []);

    function handleNewProject() {
        setNewProjectModalOpen();
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
                    onPress={handleNewProject}
                >
                    {t('New Project')}
                </Button>
                {NewProjectModal}
                <Tooltip
                    content={t('New Project')}
                    placement="bottom"
                >
                    <Button
                        aria-label={t('New Project')}
                        color="primary"
                        isIconOnly
                        className="inline-flex lg:hidden"
                        onPress={handleNewProject}
                    >
                        <LuPlus size={25}/>
                    </Button>
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
                {projects.map((project) => (
                    <ProjectCard project={project} key={project.id}/>
                ))}
            </div>
        </div>
    );
}
