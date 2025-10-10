"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {useI18n} from "@/locale/client";
import {InputOtp} from "@heroui/input-otp";
import {useRef, useState} from "react";
import {Button} from "@heroui/button";

export default function ActivatePage() {
    const t = useI18n();

    const [otp, setOtp] = useState('');
    const [remainSeconds, setRemainSeconds] = useState(0);
    const remainSecondBtRef = useRef<HTMLButtonElement>(null);

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
            // Add send code logic here
            setRemainSeconds(120);
            setTimeout(() => {
                resendCodeLoop();
            }, 1000);
        }
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
                        onValueChange={setOtp}
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
                            <Button variant="flat" onPress={handleResendCode}>
                                {t('Resend Code')}
                            </Button>
                        ) : (
                            <Button variant="flat" isDisabled ref={remainSecondBtRef}>
                                {t('Resend Code')} ({remainSeconds}s)
                            </Button>
                        )
                    }
                    <Button color="primary">
                        {t('Activate & Login')}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
