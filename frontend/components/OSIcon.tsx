import { FaLinux, FaWindows, FaApple } from "react-icons/fa";

export default function OSIcon({os, className} : {os?: string, className?: string}) {
    const osString = os ? os.toLowerCase() : "";

    switch (osString) {
        case 'linux':
            return (
                <FaLinux className={className}/>
            );
        case 'windows':
            return (
                <FaWindows className={className}/>
            );
        case 'macos':
            return (
                <FaApple className={className}/>
            );
        default:
            return null;
    }
}
