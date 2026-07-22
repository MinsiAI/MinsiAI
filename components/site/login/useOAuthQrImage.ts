"use client";

import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";

interface OAuthQrImageState {
  imageUrl: string | null;
  error: boolean;
}

export function useOAuthQrImage(authorizeUrl: string | null) {
  const [state, setState] = useState<OAuthQrImageState>({ imageUrl: null, error: false });

  useEffect(() => {
    let cancelled = false;
    setState({ imageUrl: null, error: false });

    if (!authorizeUrl) {
      return () => {
        cancelled = true;
      };
    }

    void toDataURL(authorizeUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    })
      .then((imageUrl) => {
        if (!cancelled) {
          setState({ imageUrl, error: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ imageUrl: null, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authorizeUrl]);

  return state;
}
