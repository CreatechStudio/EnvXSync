"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Form} from "@heroui/form";
import {InputOtp} from "@heroui/input-otp";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {useEffect, useRef, useState} from "react";
import {post} from "@/utils/network";
import {ApiResponse} from "../../../../../lib/types/api";
import {addToast} from "@heroui/toast";
import {Token} from "../../../../../lib/types/token";
import {sha256} from "js-sha256";
import {useTransitionRouter} from "next-transition-router";
import {Input} from "@heroui/input";

export default function ResetPasswordPage() {
    const t = useI18n();
    const [otp, setOtp] = useState('');
    const [newPd, setNewPd] = useState('');
    const [confirmPd, setConfirmPd] = useState('');
    const [email, setEmail] = useState("");

    const [remainSeconds, setRemainSeconds] = useState(0);
    const remainSecondBtRef = useRef<HTMLButtonElement>(null);
    const [resendCodeLoading, setResendCodeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [nextEnabled, setNextEnabled] = useState(false);
    const router = useTransitionRouter();

    useEffect(() => {
        const storedEmail = localStorage.getItem("reset_email");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

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
                type: "password_reset",
                email: email
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
        if (otp && otp.length === 6 && email && email.includes("@") && newPd && confirmPd && newPd === confirmPd) {
            setNextEnabled(true);
        }
    }, [otp, email, newPd, confirmPd]);

    function handleSubmit() {
        if (nextEnabled) {
            setSubmitLoading(true);
            post("/token/verify", {
                type: "password_reset",
                email: email,
                token: otp
            }).then((data: ApiResponse<string>) => {
                if (data.success && data.data) {
                    post("/login/reset-password", {
                        email: email,
                        tokenId: data.data,
                        newPasswordHash: sha256(newPd)
                    }).then((res: ApiResponse) => {
                        if (res.success) {
                            router.push("/login");
                        } else {
                            addToast({
                                title: res.error,
                                color: "danger"
                            });
                            setSubmitLoading(false);
                        }
                    });
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
                    <h3 className="font-bold text-large">{t('Reset Password By Email')}</h3>
                </div>
            </CardHeader>
            <Form onSubmit={(e) => {e.preventDefault(); handleSubmit()}}>
                <CardBody>
                    <div className="flex flex-col justify-center items-center w-full overflow-hidden gap-6">
                        <Input
                            label={t('New Password')}
                            value={newPd}
                            onValueChange={setNewPd}
                            type="password"
                        />
                        <Input
                            label={t('Confirm New Password')}
                            value={confirmPd}
                            onValueChange={setConfirmPd}
                            type="password"
                        />
                        <div className="flex flex-row justify-between w-full items-center pl-1">
                            <InputOtp
                                length={6}
                                value={otp}
                                allowedKeys="^[0-9a-zA-Z]*$"
                                onValueChange={(value) => setOtp(value.toUpperCase())}
                                variant="flat"
                                description={t('Please enter the 6-digit code sent to your email.')}
                                classNames={{
                                    description: "text-default-500 font-medium text-sm",
                                    segmentWrapper: "gap-3",
                                    errorMessage: "text-danger-600 font-medium text-sm",
                                }}
                            />
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
                        </div>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="flex flex-row-reverse items-center justify-between w-full">
                        <Button color="primary" type="submit" isDisabled={!nextEnabled} isLoading={submitLoading}>
                            {t('Reset')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
