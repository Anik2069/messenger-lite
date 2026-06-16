"use client"
import CallInterface from '@/components/Call/CallInterface';
import { useParams } from 'next/navigation';


export default function CallPage() {
    const params = useParams()
    const { callId } = params;
    console.log(callId, "params.callId")
    return (

        <CallInterface callId={callId as string} />
    );
}
