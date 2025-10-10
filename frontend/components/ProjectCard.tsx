import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {LuClock2, LuPencil} from "react-icons/lu";
import {getRelativeTime} from "@/utils/time";
import {Project} from "../../lib/types/project";
import {useCurrentLocale, useI18n} from "@/locale/client";

export default function ProjectCard({
    project
} : {
    project: Project
}   ) {
    const locale = useCurrentLocale();
    const t = useI18n();

    function handleClickProject(projectID: string) {
        window.location.href = `/project/${projectID}`;
    }

    return (
        <Card
            className="p-3"
            onPress={() => handleClickProject(project.id)}
            isPressable
        >
            <CardHeader>
                <div className="flex flex-col w-full gap-2 justify-center items-start">
                    <h3 className="font-bold text-large">{project.name}</h3>
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
    );
}
