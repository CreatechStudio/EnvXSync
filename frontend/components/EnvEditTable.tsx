import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {Checkbox} from "@heroui/checkbox";
import {getRelativeTime} from "@/utils/time";
import {Tooltip} from "@heroui/tooltip";
import {Button} from "@heroui/button";
import {LuEye, LuEyeClosed, LuPencil, LuPlus, LuSearch, LuTrash2} from "react-icons/lu";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {EnvVar} from "../../lib/types/env_var";
import {useEffect, useRef, useState} from "react";
import {getEnvVarSecretValueById} from "@/utils/project";
import useNewEnvVarModal from "@/components/NewEnvVarModal";
import {Input} from "@heroui/input";
import {Kbd} from "@heroui/kbd";
import {useHotkeys} from "react-hotkeys-hook";
import {HotkeysEvent} from "react-hotkeys-hook/packages/react-hotkeys-hook/dist/types";
import {isMac} from "@react-aria/utils";
import HotKey from "@/components/HotKey";

function TableTop({
    filterValue,
    setFilterValue,
} : {
    filterValue: string;
    setFilterValue: (filterValue: string) => void;
}) {
    const t = useI18n();
    const [setNewEnvVarModalOpen, NewEnvVarModal] = useNewEnvVarModal();
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

export default function EnvEditTable({envVars} : {envVars: EnvVar[]}) {
    const t = useI18n();
    const locale = useCurrentLocale();

    const [showSecret, setShowSecret] = useState<boolean[]>([]);
    const [secretValues, setSecretValues] = useState<string[]>([]);
    const [filteredEnvVars, setFilteredEnvVars] = useState<EnvVar[]>(envVars);
    const [filterValue, setFilterValue] = useState<string>("");

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
        setTimeout(() => {
            setSecretValues((prev) => {
                prev[index] = getEnvVarSecretValueById(envVars[index].id);
                return [...prev];
            });
        }, 500);

        setShowSecret((prev) => {
            prev[index] = true;
            return [...prev];
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

    return (
        <Table
            topContent={<TableTop filterValue={filterValue} setFilterValue={setFilterValue}/>}
        >
            <TableHeader>
                <TableColumn>{t('Key')}</TableColumn>
                <TableColumn>{t('Value')}</TableColumn>
                <TableColumn>{t('Is Secret')}</TableColumn>
                <TableColumn>{t('Last Update')}</TableColumn>
                <TableColumn align="end">{t('Actions')}</TableColumn>
            </TableHeader>
            <TableBody>
                {filteredEnvVars.map((envVar, index) => (
                    <TableRow key={index}>
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
                            <Checkbox isSelected={envVar.isSecret}/>
                        </TableCell>
                        <TableCell>{getRelativeTime(envVar.updatedAt, locale)}</TableCell>
                        <TableCell>
                            <div className="relative flex flex-row-reverse">
                                <Tooltip content={t('Delete')}>
                                    <Button isIconOnly size="sm" variant="light" color="danger">
                                        <LuTrash2 size={15}/>
                                    </Button>
                                </Tooltip>
                                <Tooltip content={t('Edit')}>
                                    <Button isIconOnly size="sm" variant="light">
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
                ))}
            </TableBody>
        </Table>
    );
}
