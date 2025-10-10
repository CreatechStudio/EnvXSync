import {Avatar} from "@heroui/avatar";
import {LuUpload, LuUser} from "react-icons/lu";
import {Button} from "@heroui/button";
import React, {useState} from "react";

function getSize(size: "sm" | "md" | "lg") {
    switch (size) {
        case "sm":
            return 16;
        case "md":
            return 20;
        case "lg":
            return 24;
        default:
            return 20;
    }
}

function MyAvatar(
    {
        src,
        name,
        size = "md",
        icon,
        className
    } : {
        src?: string,
        name?: string,
        size?: "sm" | "md" | "lg",
        icon?: React.ReactNode,
        className?: string
    }
) {
    return (
        <Avatar
            src={src}
            name={name}
            size={size}
            icon={icon ? icon : <LuUser size={getSize(size)}/>}
            className={`bg-zinc-200 ${size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-medium"} ${className || ""}`}
        />
    )
}

export default function AvatarDisplay({
    src,
    name,
    size = "md",
    upload = false
} : {
    src?: string,
    name?: string,
    size?: "sm" | "md" | "lg",
    upload?: boolean
}) {
    const [hover, setHover] = useState(false);

    return (
        <Button
            className="p-0 bg-zinc-200 disabled:opacity-100"
            radius="full"
            variant="light"
            isIconOnly
            size={size}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            isDisabled={!upload}
        >
            <div className="relative w-full h-full">
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${hover ? "opacity-0 scale-75 ease-in" : "opacity-100 scale-100 delay-200 ease-out"}`}
                    aria-hidden={hover}
                >
                    <MyAvatar
                        src={src}
                        name={name}
                        size={size}
                    />
                </div>

                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${hover ? "opacity-100 scale-100 delay-200 ease-out" : "opacity-0 scale-75 ease-in"}`}
                    aria-hidden={!hover}
                >
                    <MyAvatar
                        size={size}
                        icon={<LuUpload size={getSize(size)}/>}
                    />
                </div>
            </div>
        </Button>
    );
}
