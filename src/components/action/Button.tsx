export default function Button({
    label,
    onClick,
    variant,
    type = 'button',
    disabled = false
}: {
    label: string,
    variant?: "default" | "invert",
    onClick?: () => void,
    type?: 'button' | 'reset' | 'submit',
    disabled?: boolean
}) {
    const getClassName = () => {
        const base = disabled ? "opacity-50 cursor-not-allowed " : "cursor-pointer ";
        switch (variant) {
            case "invert":
                return base + "px-1 py-1 rounded-lg text-xs whitespace-nowrap"
            default:
                return base + "bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap hover:bg-zinc-700"
        }
    }
    return (
        <button
            title={label}
            onClick={onClick}
            type={type}
            className={getClassName()}
            disabled={disabled}
        >
            {label}
        </button>
    )
}