"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {TransitionRouter} from "next-transition-router";
import * as gsap from "gsap";
import {startTransition, useRef} from "react";
import TransitionContent from "@/components/TransitionContent";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<
            Parameters<ReturnType<typeof useRouter>["push"]>[1]
        >;
    }
}

export function Providers({ children, themeProps }: ProvidersProps) {
    const router = useRouter();

    const firstLayer = useRef<HTMLDivElement>(null);
    const secondLayer = useRef<HTMLDivElement>(null);

    return (
        <TransitionRouter
            auto
            leave={(next, from, to) => {
                const t1 = gsap.gsap
                    .timeline({onComplete: next})
                    .fromTo(
                        firstLayer.current,
                        { y: "100%" },
                        {
                            y: 0,
                            duration: 0.5,
                            ease: "circ.inOut"
                        }
                    )
                    .fromTo(
                        secondLayer.current,
                        { y: "100%" },
                        {
                            y: 0,
                            duration: 0.5,
                            ease: "circ.inOut"
                        },
                        "<50%"
                    );
                return () => {
                    t1.kill();
                };
            }}
            enter={(next) => {
                const tl = gsap.gsap
                    .timeline()
                    .fromTo(
                        secondLayer.current,
                        { y: 0 },
                        {
                            y: "-100%",
                            duration: 0.5,
                            ease: "circ.inOut",
                        },
                    )
                    .fromTo(
                        firstLayer.current,
                        { y: 0 },
                        {
                            y: "-100%",
                            duration: 0.5,
                            ease: "circ.inOut",
                        },
                        "<50%",
                    )
                    .call(() => {
                        requestAnimationFrame(() => {
                            startTransition(next);
                        });
                    }, undefined, "<50%");

                return () => {
                    tl.kill();
                };
            }}
        >
            <div
                ref={firstLayer}
                className="fixed inset-0 z-50 translate-y-full bg-linear-to-tr from-primary to-secondary"
            />
            <div
                ref={secondLayer}
                className="fixed inset-0 z-50 translate-y-full bg-transparent"
            >
                <TransitionContent/>
            </div>

            <HeroUIProvider navigate={router.push}>
                <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
            </HeroUIProvider>
        </TransitionRouter>
    );
}
