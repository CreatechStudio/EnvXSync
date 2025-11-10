import {ReactNode} from "react";

export default function SelectableTitle({
    children,
    id
} : {
    children: ReactNode
    id: string
}) {
    function handleClick() {
        window.location.hash = `#${id}`;
    }

    return (
        <div
            className="cursor-pointer relative pl-0 group hover:pl-5 transition-all duration-200 flex flex-row items-center select-none"
            id={id}
            onClick={handleClick}
        >
            <span className="absolute left-0 opacity-0 group-hover:opacity-100 text-gray-400 font-mono transition-opacity duration-200">
                #
            </span>
            {children}
        </div>
    );
}
