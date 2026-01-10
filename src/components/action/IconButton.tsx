export default function IconButton({
    title,
    icon: Icon,
    variant,
    onClick,
}: {
    title: string,
    icon: React.FC,
    variant?: "default" | "invert",
    onClick: () => void
}) {
    const getClassName = () => {
        switch (variant) {
            case "invert":
                return "px-1 py-1 cursor-pointer rounded-lg text-zinc-800 text-lg"
            default:
                return "px-1.5 py-1.5 cursor-pointer rounded-lg text-white bg-zinc-800"
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