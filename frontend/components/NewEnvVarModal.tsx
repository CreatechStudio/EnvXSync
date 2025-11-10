import {Fragment, ReactNode, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {post} from "@/utils/network";
import {ApiResponse} from "../../lib/types/api";
import {addToast} from "@heroui/toast";
import {Input} from "@heroui/input";
import {Checkbox} from "@heroui/checkbox";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {EnvVar} from "../../lib/types/env_var";

export function NewEnvVarContent({
    isOpen,
    onOpenChange
} : {
    isOpen: boolean;
    onOpenChange: () => void;
}) {
    const t = useI18n();
    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSecrete, setIsSecrete] = useState(true);

    async function handleSubmit() {
        if (!name || !value) {
            addToast({
                title: t("Some required fields are empty"),
                color: "warning"
            });
            throw "Key or Value cannot be empty";
        }

        setLoading(true);
        post("/project/env/create", {
            key: name,
            value,
            isSecrete
        }).then((data: ApiResponse<EnvVar>) => {
            if (data.success && data.data) {
                // Add env var to project
            } else {
                addToast({
                    title: data.error || "Something went error",
                    color: "danger"
                });
            }
            setLoading(false);
        }).catch(() => {
            addToast({
                title: "Failed to create environment variable",
                color: "danger"
            });
            setLoading(false);
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
                                {t("New Environment Variable")}
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    <Input
                                        isRequired
                                        label={t("Key")}
                                        type="text"
                                        value={name}
                                        onValueChange={setName}
                                    />
                                    <Input
                                        isRequired
                                        label={t("Value")}
                                        type="text"
                                        value={value}
                                        onValueChange={setValue}
                                    />
                                    <Checkbox isSelected={isSecrete} onValueChange={setIsSecrete}>
                                        {t("Is Secret")}
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

export default function useNewEnvVarModal() : [
    () => void,
    ReactNode
] {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return [
        onOpen,
        <NewEnvVarContent isOpen={isOpen} onOpenChange={onOpenChange}/>
    ];
}
