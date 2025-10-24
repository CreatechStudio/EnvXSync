import {AgentTask} from "../../lib/types/agent";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/table";
import {useI18n} from "@/locale/client";

export default function AgentTasksTable({
    agentTasks
} : {
    agentTasks: AgentTask[]
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
