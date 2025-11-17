import {Fragment, ReactNode, useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {addToast} from "@heroui/toast";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {post} from "@/utils/network";
import {ApiResponse} from "../../../lib/types/api";
import {AgentKeyPair} from "../../../lib/types/agent";
import {Base64} from "js-base64";
import {Card, CardBody} from "@heroui/card";
import {LuCopy} from "react-icons/lu";
import {CopyToClipboard} from "@/utils/clipboard";

export function NewAgentModalContent({
    isOpen,
    onOpenChange,
    refreshData
} : {
    isOpen: boolean;
    onOpenChange: () => void;
    refreshData?: () => void;
}) {
    const t = useI18n();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [upCommand, setUpCommand] = useState<string>();
    const [showCommand, setShowCommand] = useState(false);

    async function handleSubmit() {
        if (!name) {
            addToast({
                title: t("Some required fields are empty"),
                color: "warning"
            });
            throw "Name cannot be empty";
        }

        setLoading(true);

        post("/agent/admin/create", {name}).then((data: ApiResponse<AgentKeyPair>) => {
            if (data.success && data.data) {
                calcAuthKey(data.data);
                setShowCommand(true);
            } else {
                addToast({
                    title: data.error || "Failed to create agent",
                    color: "danger",
                });
            }
            setLoading(false);
        }).catch(() => {
            addToast({
                title: "Failed to create agent",
                color: "danger",
            });
            setLoading(false);
        });
    }

    function calcAuthKey(keyPair: AgentKeyPair) {
        const backendAddress = `${window.location.origin}/api`;
        const authData = {
            b: backendAddress,
            aid: keyPair.agentId,
            ak: keyPair.accessToken,
            rk: keyPair.refreshToken
        };
        const k = Base64.encode(JSON.stringify(authData)).trim();
        setUpCommand(`envxsync up --authKey=\"${k}\"`);
    }

    function handleClose(onClose: () => void) {
        setName("");
        setLoading(false);
        setUpCommand(undefined);
        setShowCommand(false);
        if (refreshData) {
            refreshData();
        } else {
            window.location.reload();
        }
        onClose();
    }

    function handleCopy() {
        if (upCommand) {
            CopyToClipboard(upCommand).then(() => {
                addToast({
                    title: t("Copied to clipboard"),
                    color: "success",
                });
            }).catch(() => {
                addToast({
                    title: t("Failed to copy"),
                    color: "warning"
                });
            });
        }
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
                                {t("New Agent")}
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6 w-full">
                                    <Input
                                        isRequired
                                        label={t("Name")}
                                        type="text"
                                        value={name}
                                        onValueChange={setName}
                                        isDisabled={showCommand}
                                    />
                                    <div className={`${showCommand ? "block" : "hidden"} w-full flex flex-col gap-2`}>
                                        <Card isBlurred>
                                            <CardBody>
                                                <div className="w-full flex flex-row justify-between items-center">
                                                    <p className="pr-2 select-none">
                                                        $
                                                    </p>
                                                    <p className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
                                                        {upCommand}
                                                    </p>
                                                    <Button
                                                        isIconOnly
                                                        variant="light"
                                                        size="sm"
                                                        onPress={() => handleCopy()}
                                                    >
                                                        <LuCopy size={18}/>
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <p className="text-sm text-gray-500 w-full text-center select-none">
                                            {t("Run this command to connect.")}
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <div className={`${showCommand ? "hidden" : "block"}`}>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => handleClose(onClose)}
                                        isDisabled={loading}
                                    >
                                        {t("Cancel")}
                                    </Button>
                                </div>
                                <div className={`${showCommand ? "hidden" : "block"}`}>
                                    <Button
                                        color="primary"
                                        onPress={handleSubmit}
                                        isLoading={loading}
                                        isDisabled={showCommand}
                                    >
                                        {t("Submit")}
                                    </Button>
                                </div>
                                <div className={`${showCommand ? "block" : "hidden"}`}>
                                    <Button
                                        color="primary"
                                        onPress={() => handleClose(onClose)}
                                        isLoading={loading}
                                        isDisabled={!showCommand}
                                    >
                                        {t("Finish")}
                                    </Button>
                                </div>
                            </ModalFooter>
                        </Fragment>
                    )
                }
            </ModalContent>
        </Modal>
    );
}

export default function useNewAgentModal(refreshData?: () => void) : [
    () => void,
    ReactNode
] {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return [
        onOpen,
        <NewAgentModalContent isOpen={isOpen} onOpenChange={onOpenChange} refreshData={refreshData}/>
    ];
}
