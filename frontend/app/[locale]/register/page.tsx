"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";
import {Form} from "@heroui/form";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";
import {useState} from "react";
import AvatarDisplay from "@/components/AvatarDisplay";
import {useTransitionRouter} from "next-transition-router";

export default function RegisterPage() {
    const router = useTransitionRouter();

    const t = useI18n();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    function handleSubmit() {
        router.push("/activate/email");
    }

    return (
        <Card className="max-w-2xl mx-auto p-3">
            <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="font-bold text-large">{t('Register New User')}</h3>
                    <AvatarDisplay
                        src={avatarUrl}
                        name={username}
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
                        <Button type="submit" color="primary">
                            {t('Next')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
