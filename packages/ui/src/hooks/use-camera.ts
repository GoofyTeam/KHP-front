"use client";

import { useCallback, useRef } from "react";
import { WANTED_IMAGE_SIZE } from "@workspace/ui/lib/const";
import { compressImageFile } from "@workspace/ui/lib/compress-img";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      try {
        const fallbackConstraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        const basicConstraints: MediaStreamConstraints = {
          video: true,
          audio: false,
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(basicConstraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
  };

  const takePhoto = useCallback(
    async (filename = `capture-${Date.now()}.jpg`) => {
      const video = videoRef.current;
      if (!video) {
        throw new Error("Camera not ready");
      }
      const w = video.videoWidth || video.clientWidth;
      const h = video.videoHeight || video.clientHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);

      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b ?? new Blob()), "image/jpeg", 0.92)
      );
      const file = new File([blob], filename, { type: "image/jpeg" });

      const compressed = await compressImageFile(file, {
        maxSizeBytes: WANTED_IMAGE_SIZE,
        maxWidth: 1600,
        maxHeight: 1600,
        mimeType: "image/jpeg", // ou "image/webp"
      });

      return compressed;
    },
    []
  );

  return { videoRef, start, stop, takePhoto };
}
