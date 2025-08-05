"use client";
import { GlobalContextProvider } from '@/provider/GlobalContextProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <GlobalContextProvider>
                {children}
            </GlobalContextProvider>
        </div>
    )
}

export default layout
