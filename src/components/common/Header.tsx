export default function Header({ children }: { children: any }) {
    return (
        <nav className="shadow-sm border-b">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-12 items-center">
                    {children}
                </div>
            </div>
        </nav>
    )
}