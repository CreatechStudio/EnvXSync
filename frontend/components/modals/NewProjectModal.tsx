import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {Fragment, ReactNode, useState} from "react";
import {Input, Textarea} from "@heroui/input";
import {Button} from "@heroui/button";
import {Checkbox} from "@heroui/checkbox";
import {post} from "@/utils/network";
import {ApiResponse} from "../../../lib/types/api";
import {Project} from "../../../lib/types/project";
import {addToast} from "@heroui/toast";
import {useI18n} from "@/locale/client";

export function NewProjectModalContent({
    isOpen,
    onOpenChange
} : {
    isOpen: boolean;
    onOpenChange: () => void;
}) {
    const t = useI18n();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [reloadOnChange, setReloadOnChange] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!name) {
            addToast({
                title: t("Some required fields are empty"),
                color: "warning"
            });
            throw "Name cannot be empty";
        }

        setLoading(true);
        post("/project/info/create", {
            name,
            description,
            reloadOnChange
        }).then((data: ApiResponse<Project>) => {
            if (data.success) {
                window.location.reload();
            } else {
                addToast({
                    title: data.error,
                    color: "danger",
                });
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            addToast({
                title: "Failed to create new project",
                color: "danger",
            });
        });
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
                                {t('New Project')}
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    <Input
                                        isRequired
                                        label={t("Name")}
                                        type="text"
                                        value={name}
                                        onValueChange={setName}
                                    />
                                    <Textarea
                                        label={t("Description")}
                                        placeholder={t("Enter your description...")}
                                        type="text"
                                        value={description}
                                        onValueChange={setDescription}
                                    />
                                    <Checkbox isSelected={reloadOnChange} onValueChange={setReloadOnChange}>
                                        {t("Reload on Change")}
                                    </Checkbox>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose} disabled={loading}>
                                    {t("Cancel")}
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => {handleSubmit().then(() => onClose())}}
                                    isLoading={loading}
                                >
                                    {t("Submit")}
                                </Button>
                            </ModalFooter>
                        </Fragment>
                    )
                }
            </ModalContent>
        </Modal>
    );
}

export default function useNewProjectModal() : [
    () => void,
    ReactNode
] {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return [
        onOpen,
        <NewProjectModalContent isOpen={isOpen} onOpenChange={onOpenChange}/>
    ];
}
