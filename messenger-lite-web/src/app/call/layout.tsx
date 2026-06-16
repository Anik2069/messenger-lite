import { AuthProvider } from "@/context/useAuth"
import "./call.css"

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div><AuthProvider>{children}</AuthProvider></div>
    )
}

export default layout