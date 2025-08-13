"use client"
import React from 'react'
import AuthForm from './AuthForm'
import { useAuthStore } from '@/store/useAuthStore'


const AuthPageComponents = () => {
    const { login, register, logout, user, loading, error } = useAuthStore()

    const onLogin = (username: string, password: string) => {
        login(username, password)
    }

    const onRegister = (email: string, username: string, password: string) => {
        register(email, username, password)
    }

    return (
        <div>
            <AuthForm onLogin={onLogin} onRegister={onRegister} />
        </div>
    )
}

export default AuthPageComponents
