"use client"
import React from 'react'
import AuthForm from './AuthForm'

const AuthPageComponents = () => {

    const onLogin = (username: string, password: string) => {

    }

    const onRegister = (username: string, password: string) => {

    }

    return (
        <div>
            <AuthForm onLogin={onLogin} onRegister={onRegister} />
        </div>
    )
}

export default AuthPageComponents
