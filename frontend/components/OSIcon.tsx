import { FaLinux, FaWindows, FaApple } from "react-icons/fa";

export default function OSIcon({os, className, size} : {os?: string, className?: string, size?: number}) {
    const osString = os ? os.toLowerCase() : "";

    switch (osString) {
        case 'linux':
            return (
                <FaLinux className={className} size={size}/>
            );
        case 'windows':
            return (
                <FaWindows className={className} size={size}/>
            );
        case 'macos':
            return (
                <FaApple className={className} size={size}/>
            );
        default:
            return null;
    }
}
