import { AuthProvider } from "@/context/useAuth"

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div><AuthProvider>{children}</AuthProvider></div>
    )
}

export default layout