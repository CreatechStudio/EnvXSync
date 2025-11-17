import {Agent, AgentTask} from "../../lib/types/agent";

const SAMPLE_AGENT_TASKS: AgentTask[] = [
    {
        id: "1",
        agentID: "1",
        command: "open",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "2",
        agentID: "1",
        command: "close",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "3",
        agentID: "2",
        command: "close",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "4",
        agentID: "1",
        command: "close",
        status: "completed",
        result: "",
        createdAt: new Date()
    },
    {
        id: "5",
        agentID: "1",
        command: "close",
        status: "failed",
        result: "",
        createdAt: new Date()
    }
]

export function getAgentById(agentID: string) {
    // get agent by id
}

export function getAgentTasks(agentID: string): AgentTask[] {
    const tasks: AgentTask[] = [];
    SAMPLE_AGENT_TASKS.forEach(task => {
        if (task.agentID === agentID) {
            tasks.push(task);
        }
    });
    return tasks;
}
