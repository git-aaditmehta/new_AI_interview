import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder(onAudioChunk) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = currentStream;
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(currentStream, { mimeType });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.current.push(e.data);
            if (onAudioChunk) onAudioChunk(e.data);
        }
      };
      
      recorder.start(500); // chunk every 500ms
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error", err);
      alert("Microphone access denied or error occurred.");
    }
  }, [onAudioChunk]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current || !isRecording) return Promise.resolve([]);

    // Resolve only after MediaRecorder finishes flushing its last chunk.
    return new Promise((resolve) => {
      const recorder = mediaRecorder.current;

      const finalize = () => {
        const allChunks = [...chunks.current];
        chunks.current = [];

        // Cleanup tracks after recorder is fully stopped.
        if (stream.current) {
          stream.current.getTracks().forEach(track => track.stop());
          stream.current = null;
        }

        mediaRecorder.current = null;
        setIsRecording(false);
        resolve(allChunks);
      };

      recorder.onstop = finalize;
      recorder.stop();
    });
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording };
}
