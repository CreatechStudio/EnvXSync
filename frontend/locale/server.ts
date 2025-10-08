import { createI18nServer } from "next-international/server";
import I18nObj from "@/locale/I18nObj";

export const {
    getI18n,
    getScopedI18n,
    getStaticParams
} = createI18nServer(I18nObj);
