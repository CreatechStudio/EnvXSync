"use client";

import {AgentTask} from "../../lib/types/agent";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {useI18n} from "@/locale/client";
import {Tooltip} from "@heroui/tooltip";
import {Button} from "@heroui/button";
import {LuPencil, LuTrash2} from "react-icons/lu";
import {Chip} from "@heroui/chip";

export function AgentTaskStatusChip({
    status
} : {
    status: AgentTask["status"];
}) {
    const t = useI18n();

    switch (status) {
        case "pending":
            return (
                <Chip color="default">{t('Pending')}</Chip>
            );
        case "completed":
            return (
                <Chip className="bg-green-600 text-secondary-foreground">{t('Completed')}</Chip>
            );
        case "failed":
            return (
                <Chip color="danger">{t('Failed')}</Chip>
            );
        case "in_progress":
            return (
                <Chip color="primary">{t('In Progress')}</Chip>
            );
    }

    return null;
}

export default function AgentTasksTable({
    agentTasks,
} : {
    agentTasks: AgentTask[],
}) {
    const t = useI18n();

    return (
        <Table>
            <TableHeader>
                <TableColumn>{t('Command')}</TableColumn>
                <TableColumn>{t('Status')}</TableColumn>
                <TableColumn>{t('Result')}</TableColumn>
                <TableColumn align="end">{t('Actions')}</TableColumn>
            </TableHeader>
            <TableBody>
                {agentTasks.map((task, index) => (
                    <TableRow key={index}>
                        <TableCell>{task.command}</TableCell>
                        <TableCell>
                            <AgentTaskStatusChip status={task.status}/>
                        </TableCell>
                        <TableCell>{task.result}</TableCell>
                        <TableCell>
                            <Tooltip content={t('Edit')}>
                                <Button isIconOnly size="sm" variant="light">
                                    <LuPencil size={15}/>
                                </Button>
                            </Tooltip>
                            <Tooltip content={t('Delete')}>
                                <Button isIconOnly size="sm" variant="light" color="danger">
                                    <LuTrash2 size={15}/>
                                </Button>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
