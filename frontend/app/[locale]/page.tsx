"use client";

import {useEffect} from "react";
import {useTransitionRouter} from "next-transition-router";
import {get} from "@/utils/network";
import {ApiResponse} from "../../../lib/types/api";
import {User} from "../../../lib/types/user";
import {addToast} from "@heroui/toast";

export default function Home() {
    const router = useTransitionRouter();

    useEffect(() => {
        get("/user/fetch").then((data: ApiResponse<User>) => {
            if (data.success) {
                if (data.data) {
                    localStorage.setItem("user", JSON.stringify(data.data));
                    router.push("/project");
                } else {
                    addToast({
                        title: data.error,
                        color: "danger"
                    });
                }
            }
        });
    }, []);

    return (
        <div/>
    );
}
