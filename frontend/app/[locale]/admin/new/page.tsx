"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";
import {Form} from "@heroui/form";
import {Button} from "@heroui/button";
import {useI18n} from "@/locale/client";

export default function NewAdmin() {
    const t = useI18n();

    function handleSubmit() {
        console.log("submitted");
    }

    return (
        <Card className="max-w-2xl mx-auto p-3">
            <CardHeader>
                <h2 className="font-bold text-large">{t('new-admin')}</h2>
            </CardHeader>
            <Form onSubmit={(event) => {event.preventDefault(); handleSubmit()}}>
                <CardBody>
                    <div className="w-full flex flex-col justify-center gap-6">
                        <div className="flex flex-row justify-center items-center gap-6">
                            <Input label={t('username')} type="text" />
                            <Input label={t('email')} type="email" />
                        </div>
                        <Input label={t('password')} type="password" />
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="w-full flex flex-row-reverse">
                        <Button type="submit" variant="faded">
                            {t('next')}
                        </Button>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    );
}
