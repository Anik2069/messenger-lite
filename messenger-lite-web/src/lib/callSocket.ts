import { SOCKET_HOST } from '@/constant';
import { io, Socket } from 'socket.io-client';
import { uuidv4 } from './utils';

let token: string | null = null;
let deviceId: string | null = null;

if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
    deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('deviceId', deviceId);
    }
}

let callSocket: Socket | null = null;

export const getCallSocket = (): Socket => {
    if (!callSocket) {
        callSocket = io(`${SOCKET_HOST}/call`, {
            withCredentials: true,
            autoConnect: true,
            auth: {
                token: token || '',
                deviceId,
                userId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : undefined
            },
            reconnection: true,
        });
    }
    return callSocket;
};

export const disconnectCallSocket = () => {
    if (callSocket) {
        callSocket.disconnect();
        callSocket = null;
    }
};
