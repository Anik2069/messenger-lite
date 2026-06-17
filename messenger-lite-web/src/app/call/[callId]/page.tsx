'use client';

import CallInterface from '@/components/Call/CallInterface';
import { useParams } from 'next/navigation';

export default function CallPage() {
  const { callId } = useParams<{ callId: string }>();

  return <CallInterface callId={callId} />;
}
