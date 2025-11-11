import {Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarItem,} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {GithubIcon, Logo} from "@/components/icons";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {I18nNames} from "@/locale/I18nObj";
import {useChangeLocale, useCurrentLocale, useI18n} from "@/locale/client";
import {supportedLanguages} from "@/middleware";
import {Button} from "@heroui/button";
import AvatarDisplay from "@/components/AvatarDisplay";
import {useEffect, useState} from "react";
import {User} from "../../lib/types/user";
import {useTransitionRouter} from "next-transition-router";

export default function Navbar() {
    const currentLocale = useCurrentLocale();
    const setLocale = useChangeLocale();
    const t = useI18n();
    const router = useTransitionRouter();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, [router]);

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <div className="flex justify-start items-center gap-1" color="foreground">
                        <Logo/>
                        <p className="font-bold text-inherit select-none">EnvXSync</p>
                    </div>
                </NavbarBrand>
                {
                    <ul className="hidden md:flex gap-6 justify-start ml-6">
                        {siteConfig.navItems.map((item) => (
                            <NavbarItem key={item.href}>
                                <Link
                                    className={clsx(
                                        linkStyles({ color: "foreground" }),
                                        "data-[active=true]:text-primary data-[active=true]:font-medium",
                                    )}
                                    color="foreground"
                                    href={`/${currentLocale}${item.href}`}
                                >
                                    {
                                        // @ts-ignore
                                        t(item.label)
                                    }
                                </Link>
                            </NavbarItem>
                        ))}
                    </ul>
                }
            </NavbarContent>

            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full items-center"
                justify="end"
            >
                <NavbarItem>
                    <Button
                        className="bg-linear-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                        radius="full"
                    >
                        {t('Upgrade to Pro')}
                    </Button>
                </NavbarItem>

                <NavbarItem className="hidden lg:flex gap-3">
                    <Link isExternal aria-label="Github" href={siteConfig.links.github}>
                        <GithubIcon className="text-default-500" />
                    </Link>
                    <ThemeSwitch />
                </NavbarItem>

                <NavbarItem>
                    <Autocomplete
                        className="max-w-30"
                        isClearable={false}
                        selectedKey={currentLocale}
                        // @ts-ignore
                        onSelectionChange={(k) => setLocale(k || currentLocale)}
                    >
                        {
                            supportedLanguages.map((language) => (
                                <AutocompleteItem key={language}>
                                    {I18nNames[language]}
                                </AutocompleteItem>
                            ))
                        }
                    </Autocomplete>
                </NavbarItem>

                <NavbarItem>
                    <AvatarDisplay
                        dropdown
                        src={user?.avatarURL}
                        username={user?.name}
                        email={user?.email}
                        clearUser={() => {
                            localStorage.removeItem("user");
                            setUser(null);
                        }}
                    />
                </NavbarItem>
            </NavbarContent>
        </HeroUINavbar>
    );
};
