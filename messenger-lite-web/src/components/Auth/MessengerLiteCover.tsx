import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  Shield,
  Zap,
  Upload,
  CheckCircle,
  Cloud,
  SmartphoneIcon as Mobile,
} from "lucide-react";

const MessengerLiteCover = () => {
  const [currentFeature, setCurrentFeature] = useState(0);


  const features = [
    {
      icon: <MessageCircle className="w-8 h-8 md:w-12 md:h-12" />,
      title: "Real-time Messaging",
      description:
        "Instant messaging with Socket.IO for seamless communication",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Users className="w-8 h-8 md:w-12 md:h-12" />,
      title: "Group Conversations",
      description: "Create and manage group chats with multiple participants",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-8 h-8 md:w-12 md:h-12" />,
      title: "Secure & Encrypted",
      description:
        "JWT authentication and encrypted URL slugs for maximum security",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Zap className="w-8 h-8 md:w-12 md:h-12" />,
      title: "Lightning Fast",
      description:
        "Built with Next.js 15 for optimal performance and scalability",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Upload className="w-8 h-8 md:w-12 md:h-12" />,
      title: "File Sharing",
      description:
        "Share images, PDFs, documents with dynamic attachment management",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Cloud className="w-8 h-8 md:w-12 md:h-12" />,
      title: "Cloud Ready",
      description:
        "Enterprise-grade architecture with PostgreSQL and Prisma ORM",
      color: "from-teal-500 to-green-500",
    },
  ];

  const techStack = [
    { name: "Next.js 15", description: "React Framework" },
    { name: "Node.js/Express", description: "Backend Runtime" },
    { name: "PostgreSQL", description: "Database" },
    { name: "Socket.IO", description: "Real-time Communication" },
    { name: "Tailwind CSS", description: "Styling" },
    { name: "Framer Motion", description: "Animations" },
  ];

  useEffect(() => {
    const checkMobile = () => {

    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Messenger Lite
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Lightweight
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Real-time Chat
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-300 mt-4 leading-relaxed">
                Enterprise-grade messaging with
                <span className="font-semibold text-white"> performance</span>,
                <span className="font-semibold text-white"> security</span>, and
                <span className="font-semibold text-white"> scalability</span>
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-3">
                {[
                  "Real-time Messaging",
                  "File Sharing",
                  "Group Chats",
                  "Mobile Responsive",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Launch App</span>
              </button>
              <button className="border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                View Documentation
              </button>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-gray-400 mb-3">Powered by:</p>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, index) => (
                  <div
                    key={tech.name}
                    className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
                  >
                    <div className="text-sm font-medium">{tech.name}</div>
                    <div className="text-xs text-gray-400">
                      {tech.description}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Feature Showcase */}
          <div className="relative">
            {/* Animated Feature Cards */}
            <div className="relative h-96 md:h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.1, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-br ${features[currentFeature].color} rounded-2xl p-8 shadow-2xl`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="text-white">
                      <div className="mb-4">
                        {features[currentFeature].icon}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-white/90 text-lg">
                        {features[currentFeature].description}
                      </p>
                    </div>

                    {/* Mock Chat Interface */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-6">
                      <div className="flex space-x-2 mb-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-start">
                          <div className="bg-white/30 rounded-lg rounded-bl-none px-3 py-2 max-w-xs">
                            <div className="text-sm">Hello there! 👋</div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-white rounded-lg rounded-br-none px-3 py-2 max-w-xs">
                            <div className="text-sm text-gray-800">
                              Hey! How are you?
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature Navigation Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentFeature
                    ? "bg-white scale-125"
                    : "bg-white/30 hover:bg-white/50"
                    }`}
                />
              ))}
            </div>

            {/* Mobile Responsive Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
            >
              <Mobile className="w-4 h-4" />
              <span className="text-sm font-medium">Mobile Responsive</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "99.9%", label: "Uptime" },
            { value: "<100ms", label: "Response Time" },
            { value: "SSL", label: "Encryption" },
            { value: "24/7", label: "Support" },
          ].map((stat, index) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MessengerLiteCover;
