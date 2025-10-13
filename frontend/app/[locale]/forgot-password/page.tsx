"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {Input} from "@heroui/input";
import {useEffect, useState} from "react";
import {Form} from "@heroui/form";
import {post} from "@/utils/network";
import {ApiResponse} from "../../../../lib/types/api";
import {useTransitionRouter} from "next-transition-router";
import {addToast} from "@heroui/toast";

export default function ForgotPasswordPage() {
    const t = useI18n();

    const [email, setEmail] = useState("");
    const [nextEnabled, setNextEnabled] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const router = useTransitionRouter();

    useEffect(() => {
        if (email && email.includes("@")) {
            setNextEnabled(true);
        }
    }, [email]);

    function handleSubmit() {
        if (nextEnabled) {
            setSubmitLoading(true);
            post("/token/generate", {
                type: "password_reset",
                email: email
            }).then((data: ApiResponse) => {
                if (data.success) {
                    localStorage.setItem("reset_email", email);
                    router.push("/activate/reset-password");
                } else {
                    addToast({
                        title: data.error,
                        color: "danger"
                    });
                    setSubmitLoading(false);
                }
            });
        }
    }

    return (
        <Card className="max-w-2xl mx-auto p-3 gap-6">
            <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="font-bold text-large">{t('Reset Password')}</h3>
                </div>
            </CardHeader>
            <Form onSubmit={(e) => {e.preventDefault(); handleSubmit()}}>
                <CardBody>
                    <div className="flex flex-col justify-center items-center w-full overflow-hidden">
                        <Input
                            label={t('email')}
                            type="email"
                            value={email}
                            onValueChange={setEmail}
                        />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="flex flex-row-reverse w-full">
                        <Button color="primary" type="submit" isDisabled={!nextEnabled} isLoading={submitLoading}>
                            {t('Next')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
