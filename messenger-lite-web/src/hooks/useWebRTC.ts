import { useCallback, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { CallState } from '@/types/call';

export function useWebRTC(callState: CallState, dispatch: React.Dispatch<any>, socket: Socket) {
    // Map of peer connections, keyed by User ID
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    // Store data channels if needed
    const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());

    // Update tracks when localStream changes (e.g. screen share toggle)
    useEffect(() => {
        const stream = callState.localStream;
        if (!stream) return;

        peersRef.current.forEach((peer) => {
            const senders = peer.getSenders();
            stream.getTracks().forEach(newTrack => {
                const sender = senders.find(s => s.track?.kind === newTrack.kind);
                if (sender) {
                    sender.replaceTrack(newTrack).catch(err => console.error('Error replacing track:', err));
                } else {
                    peer.addTrack(newTrack, stream);
                }
            });
        });

    }, [callState.localStream]);

    const createPeerConnection = useCallback((peerId: string) => {
        if (peersRef.current.has(peerId)) {
            console.log(`Peer connection for ${peerId} already exists`);
            return peersRef.current.get(peerId)!;
        }

        console.log(`Creating peer connection for ${peerId}`);

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        });

        peersRef.current.set(peerId, peer);

        // Add local tracks
        if (callState.localStream) {
            callState.localStream.getTracks().forEach(track => {
                peer.addTrack(track, callState.localStream!);
            });
        }

        // Handle remote stream
        peer.ontrack = (event) => {
            console.log(`Stream received from ${peerId}`);
            const [remoteStream] = event.streams;
            dispatch({ type: 'ADD_REMOTE_STREAM', payload: { userId: peerId, stream: remoteStream } });
        };

        // ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', {
                    toUserIds: [peerId],
                    candidate: event.candidate,
                });
            }
        };

        peer.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}:`, peer.connectionState);
            if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
                dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: { userId: peerId } });
                peersRef.current.delete(peerId);
            }
        };

        return peer;
    }, [callState.localStream, dispatch, socket]);

    const createOffer = useCallback(async (peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (!peer) {
            console.warn(`No peer connection found for ${peerId} to create offer`);
            return;
        }

        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit('webrtc_offer', {
                toUserIds: [peerId],
                sdp: offer,
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [socket]);

    const handleOffer = useCallback(async (sdp: any, peerId: string) => {
        let peer = peersRef.current.get(peerId);
        if (!peer) {
            peer = createPeerConnection(peerId);
        }

        try {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit('webrtc_answer', {
                toUserIds: [peerId],
                sdp: answer,
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [createPeerConnection, socket]);

    const handleAnswer = useCallback(async (sdp: any, peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (!peer) return;

        try {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }, []);

    const handleIceCandidate = useCallback(async (candidate: any, peerId: string) => {
        const peer = peersRef.current.get(peerId);
        if (!peer) {
            console.warn(`Received ICE candidate for unknown peer ${peerId}`);
            return;
        }

        try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }, []);

    const closePeerConnection = useCallback((peerId?: string) => {
        if (peerId) {
            const peer = peersRef.current.get(peerId);
            if (peer) {
                peer.close();
                peersRef.current.delete(peerId);
                dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: { userId: peerId } });
            }
        } else {
            // Close all
            peersRef.current.forEach(peer => peer.close());
            peersRef.current.clear();
        }
    }, [dispatch]);

    return {
        createPeerConnection,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        closePeerConnection,
        peersRef,
    };
}