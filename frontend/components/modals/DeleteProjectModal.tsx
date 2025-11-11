import React, {Fragment, ReactNode, useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {deleteReq} from "@/utils/network";
import {ApiResponse} from "../../../lib/types/api";
import {addToast} from "@heroui/toast";
import {Project} from "../../../lib/types/project";
import {User} from "../../../lib/types/user";

export function DeleteProjectModalContent({
    project,
    user,
    isOpen,
    onOpenChange
}: {
    project: Project;
    user: User;
    isOpen: boolean;
    onOpenChange: () => void;
}) {
    const t = useI18n();
    const [testName, _setTestName] = useState(`${user.name}/${project.name}`);
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [submittable, setSubmittable] = useState<boolean>(false);

    useEffect(() => {
        setSubmittable(name === testName);
    }, [name]);

    async function handleSubmit() {
        if (testName && submittable) {
            setLoading(true);
            // this endpoint not exist, waiting for backend
            deleteReq(`/project/delete/${project.id}`).then((data: ApiResponse) => {
                if (data.success) {
                    window.location.reload();
                } else {
                    addToast({
                        title: data.error || "Failed to delete project",
                        color: "danger"
                    });
                }
                setLoading(false);
            }).catch(() => {
                addToast({
                    title: "Failed to delete project",
                    color: "danger"
                });
                setLoading(false);
            });
        }
    }

    function clearData() {
        setName("");
        setSubmittable(false);
        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            isDismissable={false}
            hideCloseButton
            isKeyboardDismissDisabled
        >
            <ModalContent>
                {
                    (onClose) => (
                        <Fragment>
                            <ModalHeader className="flex flex-col gap-1 select-none">
                                {t("Delete Project")}
                                <p className="text-default-500 text-sm font-medium">{t("This project will be completely deleted, including all environment variables and settings. You would not have any method to recover it. Please be patient before you delete it.")}</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    <div className="inline-block">
                                        {t("Enter")} "<p className="font-bold inline-block select-none">{testName}</p>" {t("to make sure you decide to delete it.")}
                                    </div>
                                    <Input
                                        isRequired
                                        type="text"
                                        value={name}
                                        placeholder={t("Enter here...")}
                                        onValueChange={setName}
                                        onPaste={(e) => e.preventDefault()}
                                        isDisabled={loading}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={() => {clearData(); onClose()}} isDisabled={loading}>
                                    {t("Cancel")}
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={() => {handleSubmit().then(() => onClose())}}
                                    isDisabled={!submittable}
                                    className={submittable ? "cursor-pointer" : "cursor-not-allowed"}
                                    isLoading={loading}
                                >
                                    {t("Delete")}
                                </Button>
                            </ModalFooter>
                        </Fragment>
                    )
                }
            </ModalContent>
        </Modal>
    )
}

export default function useDeleteProjectModal(project: Project, user: User) : [
    () => void,
    ReactNode
] {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return [
        onOpen,
        <DeleteProjectModalContent isOpen={isOpen} onOpenChange={onOpenChange} project={project} user={user}/>
    ];
}
