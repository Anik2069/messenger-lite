"use client";
import { Phone, PhoneOff, Video, Mic } from "lucide-react";
import { useEffect, useState } from "react";

const IncomingCallPopup = () => {

    const [showPopup, setShowPopup] = useState(false);

    if (!showPopup) return <></>;
    const { callerName, callerAvatar, callType, onAccept, onReject, autoDismiss } = {
        callerName: "Unknown Caller",
        callerAvatar: "",
        callType: "audio", // "audio" | "video"
        onAccept: () => { },
        onReject: () => { },
        autoDismiss: 30000,
    }
    useEffect(() => {
        const timer = setTimeout(() => onReject?.(), autoDismiss);
        return () => clearTimeout(timer);
    }, [autoDismiss, onReject]);


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center z-[999999] animate-fadeIn">

            {/* Main Card */}
            <div className="w-full md:w-[380px] bg-white/10 backdrop-blur-2xl p-8 rounded-t-3xl md:rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-slideUp">

                {/* Avatar */}
                <div className="relative w-28 h-28 mx-auto">
                    <img
                        src={callerAvatar}
                        className="w-28 h-28 rounded-full object-cover border-4 border-cyan-400 shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-40"></div>
                </div>


                {/* Caller Name */}
                <h1 className="text-white text-3xl font-semibold text-center mt-5 tracking-wide">
                    {callerName}
                </h1>

                {/* Call Type */}
                <p className="text-cyan-300 text-lg mt-1 flex items-center justify-center gap-2">
                    {callType === "video" ? (
                        <>
                            <Video size={20} /> Incoming Video Call
                        </>
                    ) : (
                        <>
                            <Mic size={20} /> Incoming Audio Call
                        </>
                    )}
                </p>

                {/* Buttons Row */}
                <div className="mt-10 flex justify-center gap-12">

                    {/* Decline */}
                    <button
                        onClick={onReject}
                        className="w-15 h-15 rounded-full bg-red-600 shadow-xl flex items-center justify-center text-white hover:bg-red-700 active:scale-90 transition-all relative"
                    >
                        <PhoneOff size={24} />
                        <span className="absolute inset-0 rounded-full bg-red-600 opacity-30 hover:animate-ping"></span>
                    </button>

                    {/* Accept */}
                    <button
                        onClick={onAccept}
                        className="w-15 h-15 rounded-full bg-green-600 shadow-xl flex items-center justify-center text-white hover:bg-green-700 active:scale-90 transition-all relative"
                    >
                        {callType === "video" ? (
                            <Video size={24} />
                        ) : (
                            <Phone size={24} />
                        )}
                        <span className="absolute inset-0 rounded-full bg-green-600 opacity-30 hover:animate-ping"></span>
                    </button>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0 }
          100% { opacity: 1 }
        }

        .animate-slideUp {
          animation: slideUp .35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

        </div>
    );
}

export default IncomingCallPopup;

