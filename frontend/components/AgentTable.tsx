import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {getRelativeTime} from "@/utils/time";
import {Tooltip} from "@heroui/tooltip";
import {Button} from "@heroui/button";
import {LuPlus, LuSearch} from "react-icons/lu";
import {useCurrentLocale, useI18n} from "@/locale/client";
import {Fragment, useEffect, useRef, useState} from "react";
import {Input} from "@heroui/input";
import HotKey from "@/components/HotKey";
import {Agent} from "../../lib/types/agent";
import {AgentStatusChip} from "@/components/AgentCard";
import OSIcon from "@/components/OSIcon";
import useNewAgentModal from "@/components/modals/NewAgentModal";
import {CopyToClipboard} from "@/utils/clipboard";
import {addToast} from "@heroui/toast";

function TableTop({
    filterValue,
    setFilterValue,
    refreshData
} : {
    filterValue: string;
    setFilterValue: (filterValue: string) => void;
    refreshData?: () => void;
}) {
    const t = useI18n();
    const [setNewAgentModalOpen, NewAgentModal] = useNewAgentModal(refreshData);
    const searchInputRef = useRef<HTMLInputElement>(null);

    function handleFocusSearchInput(keyboardEvent: KeyboardEvent) {
        keyboardEvent.preventDefault();
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }

    function handleNewAgent() {
        setNewAgentModalOpen();
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
                placeholder={t("Search by agent name...")}
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
                aria-label={t('New Agent')}
                color="primary"
                startContent={<LuPlus size={20}/>}
                className="hidden lg:inline-flex"
                onPress={handleNewAgent}
            >
                {t('New Agent')}
            </Button>
            <Tooltip
                content={t('New Agent')}
                placement="bottom"
            >
                <Button
                    aria-label={t('New Agent')}
                    color="primary"
                    isIconOnly
                    className="inline-flex lg:hidden"
                    onPress={handleNewAgent}
                >
                    <LuPlus size={22}/>
                </Button>
            </Tooltip>
            {NewAgentModal}
        </div>
    );
}

export default function AgentTable({
    agents,
    refreshData
} : {
    agents: Agent[],
    refreshData?: () => void
}) {
    const t = useI18n();
    const locale = useCurrentLocale();

    const [filteredAgents, setFilteredAgents] = useState<Agent[]>(agents);
    const [filterValue, setFilterValue] = useState<string>("");

    useEffect(() => {
        if (filterValue) {
            const vars: Agent[] = [];
            const lowerFilterValue = filterValue.toLowerCase();
            agents.forEach((agent) => {
                if (agent.name.toLowerCase().includes(lowerFilterValue)) {
                    vars.push(agent);
                }
            });
            setFilteredAgents(vars);
        } else {
            setFilteredAgents(agents);
        }
    }, [agents, filterValue]);

    function handleCopy(text: string) {
        if (text) {
            CopyToClipboard(text).then(() => {
                addToast({
                    title: t("Copied to clipboard"),
                    color: "success"
                });
            }).catch(() => {
                addToast({
                    title: t("Failed to copy"),
                    color: "danger"
                });
            })
        }
    }

    return (
        <Table
            topContent={<TableTop filterValue={filterValue} setFilterValue={setFilterValue} refreshData={refreshData}/>}
            isHeaderSticky
            className="max-h-[80vh] mb-3 md:mb-6"
        >
            <TableHeader>
                <TableColumn>{t('Name')}</TableColumn>
                <TableColumn>{t('IP Address')}</TableColumn>
                <TableColumn>{t('Version')}</TableColumn>
                <TableColumn>{t('Status')}</TableColumn>
                <TableColumn>{t('Last Update')}</TableColumn>
                <TableColumn align="end">{t('Actions')}</TableColumn>
            </TableHeader>
            <TableBody>
                <Fragment>
                    <TableRow key={0} className={agents.length === 0 ? "" : "hidden"}>
                        <TableCell colSpan={6}>
                            <div className="w-full flex flex-col justify-center items-center p-6 lg:p-12 text-lg text-center">
                                {t('No agents. Try to add a new one now!')}
                            </div>
                        </TableCell>
                    </TableRow>
                    {filteredAgents.map((agent, index) => (
                        <Fragment>
                            <TableRow key={index+1}>
                                <TableCell>{agent.name || t('Unnamed Agent')}</TableCell>
                                <TableCell>
                                    <Tooltip content={t('Press to Copy')}>
                                        <Button
                                            variant="light"
                                            className="text-start"
                                            onPress={() => handleCopy(agent.ipAddress || "")}
                                        >
                                            {agent.ipAddress}
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-row gap-1 items-center">
                                        <Tooltip content={`${agent.os} - ${agent.arch}`}>
                                            <Button isIconOnly variant="light">
                                                <OSIcon os={agent.os} size={20}/>
                                            </Button>
                                        </Tooltip>
                                        <p>{agent.version}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <AgentStatusChip status={agent.status}/>
                                </TableCell>
                                <TableCell>{getRelativeTime(agent.updatedAt, locale)}</TableCell>
                                <TableCell>
                                    <div className="relative flex flex-row-reverse">
                                        {/* actions here */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </Fragment>
                    ))}
                </Fragment>
            </TableBody>
        </Table>
    );
}
