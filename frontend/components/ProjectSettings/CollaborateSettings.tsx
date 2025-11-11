import {Card, CardBody, CardHeader} from "@heroui/card";
import {Divider} from "@heroui/divider";
import React, {useEffect, useState} from "react";
import {useI18n} from "@/locale/client";
import {User as UserDisplay} from "@heroui/user";
import {Project} from "../../../lib/types/project";
import {User} from "../../../lib/types/user";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/dropdown";
import {Button} from "@heroui/button";
import { IoIosMore } from "react-icons/io";
import {LuPencil, LuTrash} from "react-icons/lu";

function UserActionDropdown({
    onDelete,
    onEdit,
    editable = true,
    deletable = true,
} : {
    onDelete?: () => void;
    onEdit?: () => void;
    editable?: boolean;
    deletable?: boolean;
}) {
    const t = useI18n();
    const [disabledKeys, setDisabledKeys] = useState<string[]>([]);

    useEffect(() => {
        const newDisabledKeys = [];
        if (!deletable) {
            newDisabledKeys.push("delete");
        }
        if (!editable) {
            newDisabledKeys.push("edit");
        }
        setDisabledKeys(newDisabledKeys);
    }, [editable, deletable]);

    return (
        <Dropdown
            placement="bottom-end"
            classNames={{
                content: "w-auto min-w-0"
            }}
        >
            <DropdownTrigger>
                <Button isIconOnly variant="light">
                    <IoIosMore size={20}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                classNames={{
                    base: "w-auto min-w-0",
                }}
                disabledKeys={disabledKeys}
            >
                <DropdownItem key="edit" onPress={onEdit}>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <LuPencil/>
                        {t("Edit")}
                    </div>
                </DropdownItem>
                <DropdownItem key="delete" color="danger" className="text-danger" onPress={onDelete}>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <LuTrash/>
                        {t("Delete")}
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default function CollaborateSettings(
    {
        project,
        user,
        setProject,
    } : {
        project: Project;
        user: User;
        setProject: (project: Project) => void;
    }
) {
    const t = useI18n();

    return (
        <Card className="w-full p-3">
            <CardHeader>
                <h3 className="font-bold text-xl">{t("Collaborate")}</h3>
            </CardHeader>
            <Divider className="mb-2"/>
            <CardBody>
                <Table
                    isHeaderSticky
                    removeWrapper
                >
                    <TableHeader>
                        <TableColumn>{t("User")}</TableColumn>
                        <TableColumn>{t("Role")}</TableColumn>
                        <TableColumn align="end">{t("Actions")}</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <UserDisplay
                                    avatarProps={{src: user.avatarURL}}
                                    description={user.email}
                                    name={user.name}
                                />
                            </TableCell>
                            <TableCell>
                                {t("Owner")}
                            </TableCell>
                            <TableCell>
                                <UserActionDropdown deletable={false} editable={false}/>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
