import { forwardRef } from "react"
import { cn } from "../../lib/helper"

const PreviewCase = forwardRef(({ className, onClick, children }: { className: string, onClick: () => void, children: any }, ref: any) => {
    const baseStyles = "pointer-events-none px-2 rounded"
    const combinedClasses = cn(baseStyles, className)
    return <div ref={ref} className="cursor-pointer" onClick={onClick}>
        <div className={combinedClasses}>{children}</div>
    </div>
})

export default PreviewCase;