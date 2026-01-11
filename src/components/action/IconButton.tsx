import { cn } from "@/lib/helper";

export default function IconButton({
    title,
    icon: Icon,
    variant,
    onClick,
    className
}: {
    title: string,
    icon: React.FC,
    variant?: "default" | "invert",
    onClick: () => void,
    className?: string
}) {
    const getClassName = () => {
        switch (variant) {
            case "invert":
                return cn("px-1 py-1 cursor-pointer rounded-lg text-lg", className)
            default:
                return cn("px-1.5 py-1.5 cursor-pointer rounded-lg text-white bg-zinc-800", className)
        }
    }
    return (
        <button
            title={title}
            onClick={onClick}
            className={getClassName()}
        >
            <Icon />
        </button>
    )
}