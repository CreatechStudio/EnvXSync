import {supportedLanguages} from "@/middleware";

const I18nObj = {
    "zh": () => import("./zh.json"),
    "en": () => import("./en.json")
};

export const I18nNames: Record<typeof supportedLanguages[number], string> = {
    "zh": "中文",
    "en": "English"
}

export default I18nObj;
