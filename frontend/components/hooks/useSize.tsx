import {useEffect, useState} from "react";

export default function useSize(size: "sm" | "md" | "lg") {
    const [isInSize, setIsInSize] = useState(false);

    useEffect(() => {
        const ele = document.createElement("div");
        ele.className = `hidden ${size}:block`;
        document.body.appendChild(ele);

        const checkBreakpoint = () => {
            const computedStyle = window.getComputedStyle(ele);
            setIsInSize(computedStyle.display !== "none");
        }

        checkBreakpoint();

        window.addEventListener("resize", checkBreakpoint);
        return () => {
            window.removeEventListener("resize", checkBreakpoint);
            document.body.removeChild(ele);
        }
    }, [size]);

    return isInSize;
}
