
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClassRoomProps {
    roomName: string;
    token: string;
    domain?: string;
    displayName: string;
    isInstructor?: boolean;
    embedded?: boolean;
    onClose: () => void;
}

/**
 * Embeds a Jitsi Meet conference directly inside the page.
 * Uses the Jitsi External API via a script tag (no SDK needed for basic use).
 * The JWT token lets students join as their registered identity.
 */
export function LiveClassRoom({
    roomName,
    token,
    domain = "meet.jit.si",
    displayName,
    isInstructor = false,
    embedded = false,
    onClose,
}: LiveClassRoomProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<unknown>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = 500; // ms

        const initJitsi = () => {
            if (!containerRef.current) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;

            if (!JitsiMeetExternalAPI) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(initJitsi, retryInterval);
                    return;
                }
                console.error("JitsiMeetExternalAPI not found after max retries");
                return;
            }

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const api = new JitsiMeetExternalAPI(domain, {
                    roomName,
                    jwt: token || undefined,
                    parentNode: containerRef.current,
                    width: "100%",
                    height: "100%",
                    configOverwrite: {
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                        disableDeepLinking: true,
                        p2p: { enabled: false }, // P2P can sometimes keep streams active
                        enableLayerSuspension: true, // Suspends video when not in use
                        prejoinPageEnabled: false,
                        prejoinConfig: {
                            enabled: false
                        },
                        readOnlyName: true,
                        enableWelcomePage: false,
                        enableClosePage: false,
                        disableModeratorIndicator: false,
                        joinByPhone: false,
                        mobileAppProto: 'shoraj-app', // Placeholder
                        disableInviteFunctions: true,
                        remoteVideoMenu: {
                            disableKick: !isInstructor,
                            disableMute: !isInstructor,
                        },
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: isInstructor
                            ? ["microphone", "camera", "desktop", "chat", "recording", "raisehand", "tileview", "fullscreen", "hangup", "mute-everyone"]
                            : ["microphone", "camera", "chat", "raisehand", "tileview", "fullscreen", "hangup"],
                        TILE_VIEW_MAX_COLUMNS: 2,
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        DEFAULT_REMOTE_DISPLAY_NAME: "Student",
                        DEFAULT_LOCAL_DISPLAY_NAME: isInstructor ? "Teacher" : "Student",
                        SHOW_POWERED_BY: false,
                        DISPLAY_WELCOME_FOOTER: false,
                    },
                    userInfo: {
                        displayName,
                    },
                });

                apiRef.current = api;
                setReady(true);

                api.addEventListener("readyToClose", () => {
                    onClose();
                });
            } catch (error) {
                console.error("Failed to initialize Jitsi API:", error);
            }
        };

        const scriptId = "jitsi-api-script";
        const existing = document.getElementById(scriptId);

        if (!existing) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://${domain}/external_api.js`;
            script.async = true;
            script.onload = initJitsi;
            script.onerror = () => console.error("Failed to load Jitsi script");
            document.body.appendChild(script);
        } else {
            // If script exists, it might still be loading or already loaded
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((window as any).JitsiMeetExternalAPI) {
                initJitsi();
            } else {
                existing.addEventListener('load', initJitsi);
            }
        }

        return () => {
            if (apiRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (apiRef.current as any).dispose?.();
                apiRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName, token, domain]);

    return (
        <div className={cn(
            "z-50 bg-zinc-950 flex flex-col overflow-hidden",
            embedded ? "w-full h-full relative" : "fixed inset-0"
        )}>
            {/* Top bar - ONLY show if not embedded (standalone view) */}
            {!embedded && (
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-white font-semibold text-sm">LIVE CLASS</span>
                        </span>
                        <span className="text-zinc-400 text-sm hidden sm:block">Room: {roomName}</span>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onClose}
                        className="gap-1.5"
                    >
                        <X className="h-4 w-4" /> Leave Class
                    </Button>
                </div>
            )}

            {/* Jitsi Container */}
            <div ref={containerRef} className="flex-1 w-full" />

            {!ready && (
                <div className={cn(
                    "flex items-center justify-center bg-zinc-950 text-white",
                    embedded ? "absolute inset-0" : "fixed inset-0"
                )}>
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                        <p className="text-zinc-400">Connecting to live class...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
