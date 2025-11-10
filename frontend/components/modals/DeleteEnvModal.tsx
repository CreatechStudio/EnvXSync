import {Fragment, ReactNode, useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {EnvVar} from "../../../lib/types/env_var";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";

export function DeleteEnvModalContent({
    envVar,
    isOpen,
    onOpenChange
}: {
    envVar?: EnvVar,
    isOpen: boolean;
    onOpenChange: () => void;
}) {
    const t = useI18n();
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [submittable, setSubmittable] = useState<boolean>(false);

    useEffect(() => {
        setSubmittable(name === envVar?.key);
    }, [name]);

    async function handleSubmit() {

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
                                {t("Delete Environment Variable")}
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    <div className="inline-block">
                                        {t("Enter")} "<p className="font-bold inline-block select-none">{envVar?.key}</p>" {t("to make sure you decide to delete it.")}
                                    </div>
                                    <Input
                                        isRequired
                                        type="text"
                                        value={name}
                                        placeholder={t("Enter here...")}
                                        onValueChange={setName}
                                        onPaste={(e) => e.preventDefault()}
                                        disabled={loading}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={onClose} disabled={loading}>
                                    {t("Cancel")}
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={() => {handleSubmit().then(() => onClose())}}
                                    disabled={!submittable}
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

export default function useDeleteEnvModal(envVar?: EnvVar) : [
    () => void,
    ReactNode
] {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return [
        onOpen,
        <DeleteEnvModalContent isOpen={isOpen} onOpenChange={onOpenChange} envVar={envVar}/>
    ];
}
