"use client";

import { useEffect, useRef, useCallback } from "react";

export default function GoogleSignInButton({ onSuccess, onError, text = "signin_with" }) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess?.(data);
      } else {
        onError?.(data.error || "Google sign-in failed");
      }
    } catch (err) {
      onError?.(err.message || "Something went wrong");
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: "100%",
          logo_alignment: "left",
        });
        initializedRef.current = true;
      }
    };
    document.head.appendChild(script);
  }, [handleCredentialResponse, text]);

  return <div ref={buttonRef} style={{ width: "100%" }} />;
}
