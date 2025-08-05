"use client"

import type React from "react"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, User, Lock, Zap, Mail } from "lucide-react"

interface AuthFormProps {
    onLogin: (username: string, password: string) => void
    onRegister: (email: string, username: string, password: string) => void
}


export default function AuthForm({ onLogin, onRegister }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (!username.trim() || !password.trim()) {
            alert("Please fill in all fields")
            return
        }

        if (username.trim().length < 2) {
            alert("Username must be at least 2 characters")
            return
        }

        setLoading(true)

        if (isLogin) {
            onLogin(username.trim(), password)
        } else {
            onRegister(email.trim(), username.trim(), password)
        }

        setTimeout(() => setLoading(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Brand Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <div className=" bg-blue-600 p-3 rounded-2xl flex items-center justify-center  shadow-lg">
                            <MessageSquare className=" w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messenger Lite</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Fast, simple, and efficient messaging</p>
                </div>

                {/* Auth Card */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold">{isLogin ? "Welcome back" : "Get started"}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isLogin ? "Sign in to continue" : "Create your account"}
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>}
                            {<div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>}

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Please wait...</span>
                                    </div>
                                ) : isLogin ? (
                                    "Sign In"
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-gray-600 dark:text-gray-400">
                        <Zap className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Lightning Fast</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                        <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Real-time Chat</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                        <User className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Simple & Clean</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
