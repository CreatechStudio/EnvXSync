import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {Checkbox} from "@heroui/checkbox";
import {getRelativeTime} from "@/utils/time";
import {Tooltip} from "@heroui/tooltip";
import {Button} from "@heroui/button";
import {LuCheck, LuEye, LuEyeClosed, LuPencil, LuPlus, LuSearch, LuTrash2} from "react-icons/lu";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {EnvVar} from "../../lib/types/env_var";
import {Fragment, useEffect, useRef, useState} from "react";
import {getEnvVarSecretValueById} from "@/utils/project";
import useNewEnvVarModal from "@/components/modals/NewEnvVarModal";
import {Input} from "@heroui/input";
import HotKey from "@/components/HotKey";
import useDeleteEnvModal from "@/components/modals/DeleteEnvModal";
import {Chip} from "@heroui/chip";
import { MdOutlineNoEncryptionGmailerrorred } from "react-icons/md";
import {Card, CardBody, CardFooter} from "@heroui/card";
import {post} from "@/utils/network";
import {ApiResponse} from "../../lib/types/api";
import {addToast} from "@heroui/toast";

function TableTop({
    filterValue,
    setFilterValue,
    projectID,
} : {
    filterValue: string;
    setFilterValue: (filterValue: string) => void;
    projectID: string;
}) {
    const t = useI18n();
    const [setNewEnvVarModalOpen, NewEnvVarModal] = useNewEnvVarModal(projectID);
    const searchInputRef = useRef<HTMLInputElement>(null);

    function handleFocusSearchInput(keyboardEvent: KeyboardEvent) {
        keyboardEvent.preventDefault();
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }

    function handleNewEnvVar() {
        setNewEnvVarModalOpen();
    }

    function handleSearchChange(value?: string) {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue("");
        }
    }

    return (
        <div className="flex flex-row w-full justify-between items-center gap-3 lg:gap-6">
            <Input
                ref={searchInputRef}
                isClearable={false}
                className="w-full lg:max-w-[40%]"
                placeholder={t("Search by key...")}
                startContent={<LuSearch/>}
                value={filterValue}
                onValueChange={handleSearchChange}
                endContent={<HotKey
                    command={["ctrl"]}
                    mainKey="k"
                    callback={handleFocusSearchInput}
                    className="hidden md:block"
                />}
            />

            <Button
                aria-label={t('New Environment Variable')}
                color="primary"
                startContent={<LuPlus size={20}/>}
                className="hidden lg:inline-flex"
                onPress={handleNewEnvVar}
            >
                {t('New Environment Variable')}
            </Button>
            <Tooltip
                content={t('New Environment Variable')}
                placement="bottom"
            >
                <Button
                    aria-label={t('New Environment Variable')}
                    color="primary"
                    isIconOnly
                    className="inline-flex lg:hidden"
                    onPress={handleNewEnvVar}
                >
                    <LuPlus size={22}/>
                </Button>
            </Tooltip>
            {NewEnvVarModal}
        </div>
    );
}

function EditEnvVarRow({
    envVar,
    onClose
} : {
    envVar: EnvVar;
    onClose: () => void;
}) {
    const t = useI18n();
    const [name, setName] = useState<string>(envVar.key);
    const [value, setValue] = useState<string>(envVar.isSecret ? "" : envVar.value);
    const [isSecret, setIsSecret] = useState<boolean>(envVar.isSecret);
    const [loading, setLoading] = useState<boolean>(false);
    const [submittable, setSubmittable] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const cardRef = useRef<HTMLDivElement>(null);

    async function handleSubmit() {
        if (!submittable) return;
        setLoading(true);
        post(`/project/env/update/${envVar.id}`, {
            key: name,
            value,
            isSecret
        }).then((data: ApiResponse) => {
            if (data.success) {
                window.location.reload();
            } else {
                addToast({
                    title: data.error || "Failed to update env var",
                    color: "danger"
                });
            }
            setLoading(false);
        }).catch(() => {
            addToast({
                title: "Failed to update env var",
                color: "danger"
            });
            setLoading(false);
        });
    }

    function handleClose() {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }

    useEffect(() => {
        if (name !== "" && value !== "") {
            if (!envVar.isSecret) {
                if (value !== envVar.value) {
                    setSubmittable(true);
                }
                if (isSecret !== envVar.isSecret) {
                    setSubmittable(true);
                }
                if (name !== envVar.key) {
                    setSubmittable(true);
                }
            } else {
                setSubmittable(true);
            }
        }
    }, [name, value, isSecret]);

    useEffect(() => {
        if (cardRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContentHeight(entry.contentRect.height);
                }
            });

            resizeObserver.observe(cardRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setVisible(true);
        }, 10);
    }, []);

    return (
        <div
            className="w-full overflow-hidden transition-all ease-in-out duration-300"
            style={{
                maxHeight: visible ? `${contentHeight}px` : 0,
                opacity: visible ? 1 : 0,
            }}
        >
            <div ref={cardRef}>
                <div className="flex flex-col w-full justify-center items-center p-5">
                    <Card className="w-full">
                        <CardBody>
                            <div className="flex flex-col gap-3 lg:gap-6 lg:p-3">
                                <Input
                                    isRequired
                                    label={t("Key")}
                                    type="text"
                                    value={name}
                                    onValueChange={setName}
                                    isDisabled={envVar.isSecret}
                                />
                                <Input
                                    isRequired
                                    label={t("Value")}
                                    type="text"
                                    value={value}
                                    onValueChange={setValue}
                                />
                                <Checkbox isSelected={isSecret} onValueChange={setIsSecret} isDisabled={envVar.isSecret}>
                                    {t("Is Secret")}
                                </Checkbox>
                            </div>
                        </CardBody>
                        <CardFooter>
                            <div className="w-full flex flex-row-reverse gap-3">
                                <Button
                                    color="primary"
                                    onPress={() => {handleSubmit().then(() => handleClose())}}
                                    isLoading={loading}
                                    isDisabled={!submittable}
                                >
                                    {t("Submit")}
                                </Button>
                                <Button color="danger" variant="light" onPress={handleClose} isDisabled={loading}>
                                    {t("Cancel")}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function EnvEditTable({envVars, projectID} : {envVars: EnvVar[], projectID: string}) {
    const t = useI18n();
    const locale = useCurrentLocale();

    const [showSecret, setShowSecret] = useState<boolean[]>([]);
    const [secretValues, setSecretValues] = useState<string[]>([]);
    const [filteredEnvVars, setFilteredEnvVars] = useState<EnvVar[]>(envVars);
    const [filterValue, setFilterValue] = useState<string>("");
    const [deleteEnvVar, setDeleteEnvVar] = useState<EnvVar>();
    const [setDeleteEnvVarModalOpen, DeleteEnvVarModal] = useDeleteEnvModal(deleteEnvVar);
    const [editIndex, setEditIndex] = useState<number>(-1);

    useEffect(() => {
        setShowSecret([...Array(envVars.length).fill(false)]);
        setSecretValues([...Array(envVars.length).fill('')]);
    }, [envVars]);

    useEffect(() => {
        if (filterValue) {
            const vars: EnvVar[] = [];
            const lowerFilterValue = filterValue.toLowerCase();
            envVars.forEach((envVar) => {
                if (envVar.key.toLowerCase().includes(lowerFilterValue)) {
                    vars.push(envVar);
                }
            });
            setFilteredEnvVars(vars);
        } else {
            setFilteredEnvVars(envVars);
        }
    }, [envVars, filterValue]);

    function handleShowSecret(index: number) {
        getEnvVarSecretValueById(envVars[index].id).then((secret) => {
            if (secret !== null) {
                setSecretValues((prev) => {
                    prev[index] = secret;
                    return [...prev];
                });
                setShowSecret((prev) => {
                    prev[index] = true;
                    return [...prev];
                });
            }
        });
    }

    function handleHideSecret(index: number) {
        setSecretValues((prev) => {
            prev[index] = '';
            return [...prev];
        });

        setShowSecret((prev) => {
            prev[index] = false;
            return [...prev];
        });
    }

    function handleDelete(index: number) {
        setDeleteEnvVar(envVars[index]);
        setDeleteEnvVarModalOpen();
    }

    function handleEdit(index: number) {
        setEditIndex(index);
    }

    return (
        <Table
            topContent={<TableTop filterValue={filterValue} setFilterValue={setFilterValue} projectID={projectID}/>}
        >
            <TableHeader>
                <TableColumn>{t('Key')}</TableColumn>
                <TableColumn>{t('Value')}</TableColumn>
                <TableColumn>{t('Is Secret')}</TableColumn>
                <TableColumn>{t('Last Update')}</TableColumn>
                <TableColumn align="end">{t('Actions')}</TableColumn>
            </TableHeader>
            <TableBody>
                <Fragment>
                    <TableRow key={0} className={envVars.length === 0 ? "" : "hidden"}>
                        <TableCell colSpan={5}>
                            <div className="w-full flex flex-col justify-center items-center p-6 lg:p-12 text-lg text-center">
                                {t('No environment variables for this project. Try to add a new one now!')}
                            </div>
                            {DeleteEnvVarModal}
                        </TableCell>
                    </TableRow>
                    {filteredEnvVars.map((envVar, index) => (
                        <Fragment>
                            <TableRow key={index+1}>
                                <TableCell>{envVar.key}</TableCell>
                                <TableCell className="grow">
                                    {
                                        envVar.isSecret ? (
                                            showSecret[index] ? (
                                                secretValues[index] || t('Loading...')
                                            ) : (
                                                <div className="rounded-full w-40 blur-sm select-none">
                                                    {envVar.value}
                                                </div>
                                            )
                                        ) : (
                                            envVar.value
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {envVar.isSecret ? (
                                        <Chip
                                            classNames={{
                                                base: "bg-linear-to-br from-indigo-500 to-pink-500 border-none",
                                                content: "drop-shadow-xs shadow-black text-white",
                                            }}
                                            className="pl-2.5 select-none"
                                            startContent={<LuCheck className="text-white"/>}
                                        >
                                            {t("Encrypted")}
                                        </Chip>
                                    ) : (
                                        <Chip
                                            classNames={{
                                                base: "bg-gray-400 dark:bg-gray-600 border-none",
                                                content: "drop-shadow-xs shadow-black text-white",
                                            }}
                                            className="pl-2.5 select-none"
                                            startContent={<MdOutlineNoEncryptionGmailerrorred className="text-white"/>}
                                        >
                                            {t("Not Encrypted")}
                                        </Chip>
                                    )}
                                </TableCell>
                                <TableCell>{getRelativeTime(envVar.updatedAt, locale)}</TableCell>
                                <TableCell>
                                    <div className="relative flex flex-row-reverse">
                                        <Tooltip content={t('Delete')}>
                                            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(index)}>
                                                <LuTrash2 size={15}/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content={t('Edit')}>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => handleEdit(index)}
                                                isDisabled={editIndex === index}
                                            >
                                                <LuPencil size={15}/>
                                            </Button>
                                        </Tooltip>
                                        {
                                            envVar.isSecret ? (
                                                showSecret[index] ? (
                                                    <Tooltip content={t('Hide Secret')}>
                                                        <Button isIconOnly size="sm" variant="light" onPress={() => handleHideSecret(index)}>
                                                            <LuEye size={15}/>
                                                        </Button>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip content={t('View Secret')}>
                                                        <Button isIconOnly size="sm" variant="light" onPress={() => handleShowSecret(index)}>
                                                            <LuEyeClosed size={15}/>
                                                        </Button>
                                                    </Tooltip>
                                                )
                                            ) : null
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>

                            {index === editIndex && (
                                <TableRow key={-(index+1)}>
                                    <TableCell colSpan={5}>
                                        <EditEnvVarRow envVar={envVar} onClose={() => setEditIndex(-1)}/>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))}
                </Fragment>
            </TableBody>
        </Table>
    );
}
