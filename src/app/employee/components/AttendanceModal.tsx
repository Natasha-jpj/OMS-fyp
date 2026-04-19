"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

interface AttendanceModalProps {
  title: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (photoData: string) => void;
  loading?: boolean;
}

export default function AttendanceModal({
  title,
  isOpen,
  onCancel,
  onConfirm,
  loading = false,
}: AttendanceModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const videoElement = videoRef.current;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoElement) videoElement.srcObject = stream;
      } catch (error) {
        console.error("Camera error:", error);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Flip the image horizontally (to match video mirror)
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

        // Convert to base64
        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        onConfirm(photoData);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="relative bg-white w-full max-w-5xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-black to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-black">{title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Position your face in the frame
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden relative mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-dashed border-white/30 rounded-full animate-pulse flex items-center justify-center">
                <ShieldCheck size={28} className="text-white/20" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              disabled={loading}
              className="flex-[2] py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Capturing...
                </>
              ) : (
                "Capture & Confirm"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
