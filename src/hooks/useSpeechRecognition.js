import { useState, useCallback, useRef } from 'react';

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    
    // Explicitly request microphone permission first to force the browser prompt
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // We just needed permission, so stop the tracks immediately
        stream.getTracks().forEach(track => track.stop());

        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setError('Speech recognition is not supported in this browser.');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setError(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      })
      .catch((err) => {
        console.error('Microphone permission error:', err);
        setError('Microphone permission was denied. Please allow it in your browser/app settings.');
      });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
}
