import {Project} from "../../../lib/types/project";
import {Tab} from "@heroui/tabs";
import SelectableTabs, {TabTitle} from "@/components/SelectableTabs";
import {LuSettings} from "react-icons/lu";
import GeneralSettings from "@/components/ProjectSettings/GeneralSettings";
import {useI18n} from "@/locale/client";
import {User} from "../../../lib/types/user";
import useSize from "@/components/hooks/useSize";
import { GoPeople } from "react-icons/go";
import CollaborateSettings from "@/components/ProjectSettings/CollaborateSettings";

export default function ProjectSettings({
    project,
    user,
    setProject,
} : {
    project: Project;
    user: User;
    setProject: (project: Project) => void;
}) {
    const t = useI18n();
    const isMd = useSize("md");

    return (
        <div className="w-full flex flex-col">
            <SelectableTabs
                isVertical={isMd}
                paramKey="settings-tab"
                variant="solid"
                defaultTab="general"
                classNames={{
                    "base": "mr-0 md:mr-3 lg:mr-6",
                }}
            >
                <Tab key="general" title={<TabTitle
                    title={t(("General"))}
                    icon={<LuSettings/>}
                    className="text-medium lg:text-medium"
                />} className="w-full"
                >
                    <GeneralSettings project={project} user={user} setProject={setProject}/>
                </Tab>

                <Tab key="collaborate" title={<TabTitle
                    title={t("Collaborate")}
                    icon={<GoPeople/>}
                    className="text-medium lg:text-medium"
                />} className="w-full">
                    <CollaborateSettings project={project} user={user} setProject={setProject}/>
                </Tab>
            </SelectableTabs>
        </div>
    );
}
