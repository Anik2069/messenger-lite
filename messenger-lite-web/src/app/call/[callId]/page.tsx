import CallInterface from '@/components/Call/CallInterface';
import { CallProvider } from '@/context/CallContext';

interface CallPageProps {
    params: {
        callId: string;
    };
}

export default function CallPage({ params }: CallPageProps) {
    console.log(params.callId, "params.callId")
    return (
        <CallProvider>
            <CallInterface callId={params.callId} />
        </CallProvider>
    );
}
