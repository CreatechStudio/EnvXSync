"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {useI18n} from "@/locale/client";
import {InputOtp} from "@heroui/input-otp";
import {useEffect, useRef, useState} from "react";
import {Button} from "@heroui/button";
import {ApiResponse} from "../../../../../lib/types/api";
import {useTransitionRouter} from "next-transition-router";
import {addToast} from "@heroui/toast";
import {post} from "@/utils/network";

export default function ActivatePage() {
    const t = useI18n();
    const router = useTransitionRouter();

    const [otp, setOtp] = useState('');
    const [remainSeconds, setRemainSeconds] = useState(0);
    const remainSecondBtRef = useRef<HTMLButtonElement>(null);
    const [resendCodeLoading, setResendCodeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [nextEnabled, setNextEnabled] = useState(false);

    function resendCodeLoop() {
        if (remainSecondBtRef.current) {
            setRemainSeconds((prev) => {
                if (prev > 0) {
                    return prev - 1;
                } else {
                    return 0;
                }
            });
            setTimeout(() => {
                resendCodeLoop();
            }, 1000);
        }
    }

    function handleResendCode() {
        if (remainSeconds <= 0) {
            setResendCodeLoading(true);
            post("/token/generate", {
                type: "email_verification"
            }).then((data: ApiResponse) => {
                if (data.success) {
                    setRemainSeconds(60);
                    setTimeout(() => {
                        resendCodeLoop();
                    }, 1000);
                } else {
                    addToast({
                        title: data.error,
                        color: "danger"
                    });
                }
                setResendCodeLoading(false);
            });
        }
    }

    useEffect(() => {
        if (otp && otp.length === 6) {
            setNextEnabled(true);
        }
    }, [otp]);

    function handleSubmit() {
        if (!nextEnabled) {
            return;
        }

        setSubmitLoading(true);
        post('/token/verify', {
            token: otp,
            type: "email_verification"
        }).then((data: ApiResponse) => {
            if (data.success) {
                router.push("/");
            } else {
                addToast({
                    title: data.error,
                    color: "danger"
                });
                setSubmitLoading(false);
            }
        });
    }

    return (
        <Card className="max-w-2xl mx-auto p-3 gap-6">
            <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="font-bold text-large">{t('Activate By Email')}</h3>
                </div>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col justify-center items-center w-full overflow-hidden">
                    <InputOtp
                        length={6}
                        value={otp}
                        allowedKeys="^[0-9a-zA-Z]*$"
                        onValueChange={(value) => setOtp(value.toUpperCase())}
                        variant="flat"
                        description={t('Please enter the 6-digit code sent to your email.')}
                        classNames={{
                            base: "flex flex-col w-full items-center justify-center gap-1",
                            description: "text-default-500 font-medium text-sm",
                            segmentWrapper: "gap-3",
                            errorMessage: "text-danger-600 font-medium text-sm",
                        }}
                    />
                </div>
            </CardBody>
            <CardFooter>
                <div className="flex flex-row items-center justify-between w-full">
                    {
                        remainSeconds === 0 ? (
                            <Button variant="flat" onPress={handleResendCode} isLoading={resendCodeLoading}>
                                {t('Resend Code')}
                            </Button>
                        ) : (
                            <Button variant="flat" isDisabled ref={remainSecondBtRef}>
                                {t('Resend Code')} ({remainSeconds}s)
                            </Button>
                        )
                    }
                    <Button color="primary" onPress={handleSubmit} isDisabled={!nextEnabled} isLoading={submitLoading}>
                        {t('Activate & Login')}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
