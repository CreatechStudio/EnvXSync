"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Form} from "@heroui/form";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {useEffect, useState} from "react";
import {sha256} from "js-sha256";
import {ApiResponse} from "../../../../lib/types/api";
import {User} from "../../../../lib/types/user";
import {useTransitionRouter} from "next-transition-router";
import {addToast} from "@heroui/toast";
import {get, post} from "@/utils/network";
import {Link} from "@heroui/link";

export default function LoginPage() {
    const t = useI18n();
    const router = useTransitionRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nextEnabled, setNextEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (email && password && email.includes('@')) {
            setNextEnabled(true);
        }
    }, [email, password]);

    function handleSubmit() {
        if (nextEnabled) {
            setLoading(true);

            post("/login/login", {
                email: email,
                passwordHash: sha256(password)
            }).then((data: ApiResponse<User>) => {
                if (data.success) {
                    if (data.data) {
                        if (data.data.isVerified) {
                            localStorage.setItem("user", JSON.stringify(data.data));
                            router.push("/");
                        } else {
                            router.push("/activate/email");
                        }
                    }
                } else {
                    addToast({
                        title: data.error,
                        color: "danger"
                    });
                    setLoading(false);
                }
            });
        }
    }

    return (
        <Card className="max-w-2xl mx-auto p-3">
            <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="font-bold text-large">{t('Login')}</h3>
                </div>
            </CardHeader>

            <Form onSubmit={(event) => {event.preventDefault(); handleSubmit()}}>
                <CardBody>
                    <div className="w-full flex flex-col justify-center gap-6">
                        <Input
                            label={t('email')}
                            type="email"
                            value={email}
                            onValueChange={setEmail}
                        />
                        <Input
                            label={t('Password')}
                            type="password"
                            value={password}
                            onValueChange={setPassword}
                        />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-col justify-start pl-3 gap-1">
                            <Link href="/forgot-password" color="foreground" className="hover:text-primary select-none text-sm">
                                {t('Forgot Password?')}
                            </Link>
                            <Link href="/register" color="foreground" className="hover:text-primary select-none text-sm">
                                {t('No account yet? Sign Up Now!')}
                            </Link>
                        </div>
                        <Button type="submit" color="primary" isDisabled={!nextEnabled} isLoading={loading}>
                            {t('Next')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
