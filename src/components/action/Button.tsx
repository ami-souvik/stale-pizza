export default function Button({
    label,
    onClick,
    variant,
    type = 'button'
}: {
    label: string,
    variant?: "default" | "invert",
    onClick?: () => void
    type?: 'button' | 'reset' | 'submit'
}) {
    const getClassName = () => {
        switch (variant) {
            case "invert":
                return "px-1 py-1 cursor-pointer rounded-lg text-xs"
            default:
                return "bg-zinc-800 text-white text-xs px-3 py-1.5 cursor-pointer rounded-lg hover:bg-zinc-700"
        }
    }
    return (
        <button
            title={label}
            onClick={onClick}
            type={type}
            className={getClassName()}
        >
            {label}
        </button>
    )
}