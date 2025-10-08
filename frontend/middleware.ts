import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";

export const supportedLanguages = ["en", "zh"];

const defaultLanguage = "en";

const I18nMiddleware = createI18nMiddleware({
    locales: supportedLanguages,
    defaultLocale: defaultLanguage,
});

/**
 * Detect preferred language from request headers
 * @param request NextRequest object
 * @returns The detected locale (en or zh)
 */
function detectLanguage(request: NextRequest): string {
    // Get Accept-Language header
    const acceptLanguage = request.headers.get("Accept-Language") || "";

    // Parse the languages from the header
    const languages = acceptLanguage
        .split(",")
        .map(lang => {
            const [language, priority = "1.0"] = lang.trim().split(";q=");
            return {
                language: language.split("-")[0].toLowerCase(), // Get language code and ignore region
                priority: parseFloat(priority),
            };
        })
        .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

    // Find the first supported language
    const preferredLanguage = languages.find(lang =>
        supportedLanguages.includes(lang.language)
    );

    // Return the preferred language if found, otherwise default to en
    return preferredLanguage ? preferredLanguage.language : defaultLanguage;
}

function checkStartWithLocale(pathname: string): boolean {
    for (let i = 0; i < supportedLanguages.length; i++) {
        if (pathname.startsWith(`/${supportedLanguages[i]}`)) {
            return true;
        }
    }
    return false;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const isExcluded = /^\/(?:api|static|.*\.|_next|favicon.ico|robots.txt)/.test(
        pathname
    );
    if (isExcluded) {
        return NextResponse.next();
    }

    if (checkStartWithLocale(pathname)) {
        return I18nMiddleware(request);
    }

    // Detect user's preferred language
    const detectedLocale = detectLanguage(request);

    const url = new URL(request.url);
    url.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
