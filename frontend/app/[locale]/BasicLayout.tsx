"use client";

import {Providers} from "@/app/[locale]/providers";
import Navbar from "@/components/navbar";
import {ToastProvider} from "@heroui/toast";
import {I18nProviderClient} from "@/locale/client";

export default function BasicLayout({
    locale,
    children
} : {
    locale: string,
    children: React.ReactNode
}) {
    return (
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <I18nProviderClient locale={locale}>
                <div className="relative flex flex-col h-screen">
                    <Navbar/>
                    <ToastProvider/>
                    <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                        {children}
                    </main>
                </div>
            </I18nProviderClient>
        </Providers>
    );
}
