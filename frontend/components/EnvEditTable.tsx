import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {Checkbox} from "@heroui/checkbox";
import {getRelativeTime} from "@/utils/time";
import {Tooltip} from "@heroui/tooltip";
import {Button} from "@heroui/button";
import {LuEye, LuEyeClosed, LuPencil, LuTrash2} from "react-icons/lu";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {EnvVar} from "../../lib/types/env_var";
import {useEffect, useState} from "react";
import {getEnvVarSecretValueById} from "@/utils/project";

export default function EnvEditTable({envVars} : {envVars: EnvVar[]}) {
    const t = useI18n();
    const locale = useCurrentLocale();

    const [showSecret, setShowSecret] = useState<boolean[]>([]);
    const [secretValues, setSecretValues] = useState<string[]>([]);

    useEffect(() => {
        setShowSecret([...Array(envVars.length).fill(false)]);
        setSecretValues([...Array(envVars.length).fill('')]);
    }, [envVars]);

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
        <Table>
            <TableHeader>
                <TableColumn>{t('Key')}</TableColumn>
                <TableColumn>{t('Value')}</TableColumn>
                <TableColumn>{t('Is Secret')}</TableColumn>
                <TableColumn>{t('Last Update')}</TableColumn>
                <TableColumn align="end">{t('Actions')}</TableColumn>
            </TableHeader>
            <TableBody>
                {envVars.map((envVar, index) => (
                    <TableRow key={index}>
                        <TableCell>{envVar.key}</TableCell>
                        <TableCell className="grow">
                            {
                                envVar.isSecret ? (
                                    showSecret[index] ? (
                                        secretValues[index] || t('LoadingIcon...')
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