import {Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarItem,} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {GithubIcon, Logo} from "@/components/icons";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {I18nNames} from "@/locale/I18nObj";
import {useChangeLocale, useCurrentLocale, useI18n} from "@/locale/client";
import {supportedLanguages} from "@/middleware";

export default function Navbar() {
    const currentLocale = useCurrentLocale();
    const setLocale = useChangeLocale();
    const t = useI18n();

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/">
                        <Logo />
                        <p className="font-bold text-inherit">EnvXSync</p>
                    </NextLink>
                </NavbarBrand>
                <ul className="hidden lg:flex gap-4 justify-start ml-2">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <NextLink
                                className={clsx(
                                    linkStyles({ color: "foreground" }),
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href={item.href}
                            >
                                {
                                    // @ts-ignore
                                    t(item.label)
                                }
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end"
            >
                <NavbarItem className="hidden sm:flex gap-3">
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
            </NavbarContent>
        </HeroUINavbar>
    );
};
