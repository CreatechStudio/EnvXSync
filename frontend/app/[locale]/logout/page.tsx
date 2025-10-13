"use client";

import {useTransitionRouter} from "next-transition-router";
import {useEffect} from "react";
import {get} from "@/utils/network";

export default function LogoutPage() {
    const router = useTransitionRouter();

    useEffect(() => {
        get("/login/logout").then(() => {
            localStorage.removeItem("user");
            router.push("/login");
        });
    }, []);

    return (
        <div>
            Logging out...
        </div>
    );
}
