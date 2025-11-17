"use client"

import {useEffect, useState} from "react";
import {Agent} from "../../../../lib/types/agent";
import AgentTable from "@/components/AgentTable";
import {get} from "@/utils/network";
import {ApiResponse} from "../../../../lib/types/api";
import {addToast} from "@heroui/toast";

export default function AgentPage() {
    const [agents, setAgents] = useState<Agent[]>([]);

    function refreshAgentsData() {
        get("/agent/admin/fetch/all").then((data: ApiResponse<Agent[]>) => {
            if (data.success && data.data) {
                setAgents(data.data);
            } else {
                addToast({
                    title: data.error || "Failed to fetch agents",
                    color: "danger"
                });
            }
        }).catch(() => {
            addToast({
                title: "Failed to fetch agents",
                color: "danger"
            });
        });
    }

    useEffect(() => {
        refreshAgentsData();
    }, []);

    return (
        <AgentTable agents={agents} refreshData={refreshAgentsData}/>
    );
}
