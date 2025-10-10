import {Logo} from "@/components/icons";

export default function TransitionContent() {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <Logo className="w-20 h-20 text-white"/>
            <h2 className="font-extrabold text-3xl select-none text-white">EnvXSync</h2>
        </div>
    );
}
