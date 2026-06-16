import React from 'react'
import { CallProvider } from '@/context/CallContext'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <CallProvider>
            {children}
        </CallProvider>
    )
}

export default layout