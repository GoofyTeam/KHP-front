"use client";

import { useRef } from "react";

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

  const takePhoto = async (
    fileName = `image-${Date.now()}.jpg`
  ): Promise<File> => {
    const video = videoRef.current;
    if (!video) throw new Error("Camera not ready");

    const canvas = document.createElement("canvas");
    const videoWidth = video.videoWidth || 1080;
    const videoHeight = video.videoHeight || 1080;
    const squareSize = Math.min(videoWidth, videoHeight);

    canvas.width = squareSize;
    canvas.height = squareSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const sx = (videoWidth - squareSize) / 2;
    const sy = (videoHeight - squareSize) / 2;
    ctx.drawImage(
      video,
      sx,
      sy,
      squareSize,
      squareSize,
      0,
      0,
      squareSize,
      squareSize
    );

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Failed to create image blob")),
        "image/jpeg",
        1
      )
    );
    return new File([blob], fileName, { type: "image/jpeg" });
  };

  return { videoRef, start, stop, takePhoto };
}
