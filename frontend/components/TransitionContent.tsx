"use client";

import {Logo} from "@/components/icons";
import {useEffect, useRef, useState} from "react";
import {I18nProviderClient, useI18n} from "@/locale/client";
import {useParams} from "next/navigation";

export default function TransitionContent() {
    const {locale} = useParams<{locale: string}>();

    return (
        <I18nProviderClient locale={locale}>
            <TransitionContentContent/>
        </I18nProviderClient>
    );
}

export function TransitionContentContent() {
    const t = useI18n();
    const ref = useRef<HTMLDivElement>();

    let entryTime = Date.now();
    const [timeExceeded, setTimeExceeded] = useState(false);

    function timeCheckLoop() {
        if (Date.now() - entryTime > 5000) {
            setTimeExceeded(true);
        } else {
            setTimeout(timeCheckLoop, 1000);
        }
    }

    function handleRefresh() {
        window.location.reload();
    }

    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entryTime = Date.now();
                    timeCheckLoop();
                } else {
                    setTimeExceeded(false);
                }
            });
        }, {
            root: null,
            threshold: 0.9,
            rootMargin: "0px"
        });

        if (ref.current) {
            io.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                io.unobserve(ref.current);
            }
        }
    }, []);

    return (
        // @ts-ignore
        <div className="w-full h-full flex flex-col justify-center items-center gap-6" ref={ref}>
            <div className="flex flex-col justify-center items-center">
                <Logo className="w-20 h-20 text-white"/>
                <h2 className="font-extrabold text-3xl select-none text-white">EnvXSync</h2>
            </div>
            <div className={
                `transition-all duration-300 ease-in-out 
            ${timeExceeded ? 'opacity-100' : 'h-0 opacity-0 select-none'}`
            }>
                <p className="text-center text-white">
                    {t('Loading is taking longer than expected')}{t('.')}
                    <br/>
                    {t('Please')} <a onClick={handleRefresh} className="cursor-pointer underline">{t('refresh')}</a> {t('or try again later')}{t('.')}
                </p>
            </div>
        </div>
    );
}
