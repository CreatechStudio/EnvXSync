import {Avatar} from "@heroui/avatar";
import {LuCopy, LuUpload, LuUser} from "react-icons/lu";
import {Button} from "@heroui/button";
import React, {Fragment, useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {Input} from "@heroui/input";
import AvatarEditor from "react-avatar-editor";
import {Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@heroui/dropdown";
import {Divider} from "@heroui/divider";
import {useTransitionRouter} from "next-transition-router";
import {get} from "@/utils/network";
import {useI18n} from "@/locale/client";

function getSize(size: "sm" | "md" | "lg") {
    switch (size) {
        case "sm":
            return 16;
        case "md":
            return 20;
        case "lg":
            return 24;
        default:
            return 20;
    }
}

function MyAvatar(
    {
        src,
        name,
        size = "md",
        icon,
        className
    } : {
        src?: string,
        name?: string,
        size?: "sm" | "md" | "lg",
        icon?: React.ReactNode,
        className?: string
    }
) {
    return (
        <Avatar
            src={src}
            name={name}
            size={size}
            icon={icon ? icon : <LuUser size={getSize(size)}/>}
            className={`bg-zinc-200 dark:bg-zinc-700 ${size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-medium"} ${className || ""}`}
        />
    );
}

function AvatarContent({
    src,
    name,
    size = "md",
    upload = false,
    onUploadSuccess,
} : {
    src?: string,
    name?: string,
    size?: "sm" | "md" | "lg",
    upload?: boolean,
    onUploadSuccess?: (avatarURL: string) => void,
}) {
    const [hover, setHover] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [uploadURL, setUploadURL] = useState("");

    return (
        <Button
            className="p-0 bg-zinc-200 dark:bg-zinc-700 disabled:opacity-100"
            radius="full"
            variant="light"
            isIconOnly
            size={size}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            isDisabled={!upload}
            onPress={() => {if (upload) onOpen()}}
        >
            <div className="relative w-full h-full">
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${hover ? "opacity-0 scale-75 ease-in" : "opacity-100 scale-100 delay-200 ease-out"}`}
                    aria-hidden={hover}
                >
                    <MyAvatar
                        src={src}
                        name={name}
                        size={size}
                    />
                </div>

                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${hover ? "opacity-100 scale-100 delay-200 ease-out" : "opacity-0 scale-75 ease-in"}`}
                    aria-hidden={!hover}
                >
                    <MyAvatar
                        size={size}
                        icon={<LuUpload size={getSize(size)}/>}
                    />
                </div>
            </div>

            <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Upload Avatar</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-6 items-center justify-center">
                            <AvatarEditor
                                image={uploadURL || ""}
                            />

                            <Input
                                value={uploadURL}
                                placeholder="Avatar URL"
                                type="text"
                                onValueChange={setUploadURL}
                                size={size}
                                classNames={{
                                    inputWrapper: "h-auto",
                                    innerWrapper: "m-1"
                                }}
                                endContent={
                                    <Button
                                        size={size}
                                        isIconOnly
                                        variant="light"
                                    >
                                        <LuCopy size={getSize(size)}/>
                                    </Button>
                                }
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="w-full flex flex-row-reverse">
                            <Button color="primary">
                                Upload
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Button>
    );
}

export default function AvatarDisplay({
    src,
    name,
    size = "md",
    upload = false,
    onUploadSuccess,
    dropdown = false,
    username,
    email,
    clearUser,
} : {
    src?: string,
    name?: string,
    size?: "sm" | "md" | "lg",
    upload?: boolean,
    onUploadSuccess?: (avatarURL: string) => void,
    dropdown?: boolean,
    username?: string,
    email?: string,
    clearUser?: () => void,
}) {
    if (!dropdown) {
        return (
            <AvatarContent
                src={src}
                name={name}
                size={size}
                upload={upload}
                onUploadSuccess={onUploadSuccess}
            />
        );
    }

    const router = useTransitionRouter();
    const t = useI18n();

    function handleLogout() {
        if (clearUser) {
            clearUser();
        }
        get("/login/logout").then(() => {
            router.push("/login");
        });
    }

    function handleLogin() {
        router.push("/login");
    }

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger className="cursor-pointer flex flex-col items-center justify-center">
                <div>
                    <AvatarContent
                        src={src}
                        name={name}
                        size={size}
                        upload={upload}
                        onUploadSuccess={onUploadSuccess}
                    />
                </div>
            </DropdownTrigger>
            <DropdownMenu variant="flat" disabledKeys={["divider-1"]}>
                {
                    username || email ? (
                        <Fragment>
                            <DropdownItem key="user-info">
                                <div className="flex flex-col">
                                    <p className="font-bold">{username}</p>
                                    <p className="text-default-500 text-sm">{email}</p>
                                </div>
                            </DropdownItem>
                            <DropdownItem key="divider-1">
                                <Divider/>
                            </DropdownItem>
                            <DropdownItem key="settings">
                                {t('Settings')}
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                                {t('Logout')}
                            </DropdownItem>
                        </Fragment>
                    ) : (
                        <DropdownItem key="login" onPress={handleLogin}>
                            {t('Login')}
                        </DropdownItem>
                    )
                }
            </DropdownMenu>
        </Dropdown>
    );
}
