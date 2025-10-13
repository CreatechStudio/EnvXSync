"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";
import {Form} from "@heroui/form";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {useEffect, useState} from "react";
import AvatarDisplay from "@/components/AvatarDisplay";
import {useTransitionRouter} from "next-transition-router";
import {Md5} from "ts-md5";
import {sha256} from "js-sha256";
import {ApiResponse} from "../../../../lib/types/api";
import {User} from "../../../../lib/types/user";
import {Token} from "../../../../lib/types/token";
import {addToast} from "@heroui/toast";
import {post} from "@/utils/network";

export default function RegisterPage() {
    const router = useTransitionRouter();

    const t = useI18n();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nextEnabled, setNextEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleSubmit() {
        if (nextEnabled) {
            setLoading(true);

            post('/login/register', {
                name: username,
                email: email,
                passwordHash: sha256(password)
            }).then((data: ApiResponse<User>) => {
                if (data.success) {
                    post('/login/login', {
                        email: email,
                        passwordHash: sha256(password)
                    }).then((data: ApiResponse<User>) => {
                        if (data.success && !data.data?.isVerified) {
                            post('/user/avatar', {
                                avatarUrl: avatarUrl,
                            }).then((data: ApiResponse) => {
                                if (data.success) {
                                    post('/token/generate', {
                                        type: "email_verification",
                                        email: ""
                                    }).then((data: ApiResponse<Token>) => {
                                        if (data.success) {
                                            router.push("/activate/email");
                                        } else {
                                            addToast({
                                                title: data.error,
                                                color: "danger"
                                            });
                                            setLoading(false);
                                        }
                                    });
                                } else {
                                    addToast({
                                        title: data.error,
                                        color: "danger"
                                    });
                                    setLoading(false);
                                }
                            });
                        } else {
                            addToast({
                                title: data.error,
                                color: "danger"
                            });
                            setLoading(false);
                        }
                    });
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

    useEffect(() => {
        if (username && email && password && confirmPassword && password === confirmPassword && email.includes('@')) {
            setNextEnabled(true);
        } else {
            setNextEnabled(false);
        }
    }, [username, email, password, confirmPassword]);

    function handleEmailBlur() {
        if (avatarUrl) {
            return;
        }

        if (email && email.includes('@')) {
            const emailMd5 = Md5.hashStr(email.trim().toLowerCase());
            setAvatarUrl(`https://www.gravatar.com/avatar/${emailMd5}?d=retro`);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto p-3">
            <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="font-bold text-large">{t('Register New User')}</h3>
                    <AvatarDisplay
                        src={avatarUrl}
                        upload
                    />
                </div>
            </CardHeader>

            <Form onSubmit={(event) => {event.preventDefault(); handleSubmit()}}>
                <CardBody>
                    <div className="w-full flex flex-col justify-center gap-6">
                        <div className="flex flex-row justify-center items-start gap-6">
                            <Input
                                label={t('username')}
                                type="text"
                                value={username}
                                onValueChange={setUsername}
                            />
                            <Input
                                label={t('email')}
                                type="email"
                                value={email}
                                onValueChange={setEmail}
                                onBlur={handleEmailBlur}
                            />
                        </div>
                        <Input
                            label={t('Password')}
                            type="password"
                            value={password}
                            onValueChange={setPassword}
                        />
                        <Input
                            label={t('Confirm Password')}
                            type="password"
                            value={confirmPassword}
                            onValueChange={setConfirmPassword}
                        />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex flex-row-reverse">
                        <Button type="submit" color="primary" isDisabled={!nextEnabled} isLoading={loading}>
                            {t('Next')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
