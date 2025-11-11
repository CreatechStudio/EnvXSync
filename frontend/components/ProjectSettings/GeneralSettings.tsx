import {Card, CardBody, CardHeader} from "@heroui/card";
import {Divider} from "@heroui/divider";
import React, {useState} from "react";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {Project} from "../../../lib/types/project";
import useDeleteProjectModal from "@/components/modals/DeleteProjectModal";
import {User} from "../../../lib/types/user";
import {Switch} from "@heroui/switch";
import { Textarea } from "@heroui/input";
import {LuSave} from "react-icons/lu";
import {removeFromUint8Array} from "next/dist/server/stream-utils/uint8array-helpers";

export default function GeneralSettings({
    project,
    user,
    setProject,
} : {
    project: Project;
    user: User;
    setProject: (project: Project) => void;
}) {
    const t = useI18n();
    const [onProjectDeleteModalOpen, ProjectDeleteModal] = useDeleteProjectModal(project, user);
    const [reloadOnChangeLoading, setReloadOnChangeLoading] = useState<boolean>(false);
    const [description, setDescription] = useState<string>(project.description);

    function handleSelectReloadOnChange(select: boolean) {
        // update select and project
        setReloadOnChangeLoading(true);
        setTimeout(() => {
            setProject({
                ...project,
                reloadOnChange: select
            });
            setReloadOnChangeLoading(false);
        }, 1000);
    }

    function handleSaveDescription() {
        // update new description here
    }

    return (
        <Card className="w-full p-3">
            <CardHeader>
                <h3 className="font-bold text-xl">{t("General")}</h3>
            </CardHeader>
            <Divider className="mb-2"/>
            <CardBody>
                <div className="w-full flex flex-col justify-center items-center gap-6">
                    <div className="w-full flex flex-col justify-start items-start gap-1.5">
                        <div className="w-full flex flex-row justify-between items-center">
                            <p className="font-semibold">{t("Description")}</p>
                            <Button
                                size="sm"
                                startContent={<LuSave/>}
                                variant="light"
                                onPress={handleSaveDescription}
                            >
                                Save
                            </Button>
                        </div>
                        <Textarea
                            placeholder={t("This man is lazy, no description here!")}
                            value={description}
                            onValueChange={setDescription}
                        />
                    </div>

                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <p className="font-semibold">{t("Reload on Change")}</p>
                            <p className="text-default-500 text-sm">{t("When environment variables change, agents will automatically redeploy the service.")}</p>
                        </div>
                        <Switch
                            isSelected={project.reloadOnChange}
                            onValueChange={handleSelectReloadOnChange}
                            isDisabled={reloadOnChangeLoading}
                        />
                    </div>

                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <p className="font-semibold">{t("Delete this project")}</p>
                            <p className="text-default-500 text-sm">{t("This project will be completely deleted without any method to recover.")}</p>
                        </div>
                        <Button color="danger" onPress={onProjectDeleteModalOpen}>
                            {t("Delete")}
                        </Button>
                        {ProjectDeleteModal}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
