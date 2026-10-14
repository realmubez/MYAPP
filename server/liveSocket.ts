import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export function setupLiveWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[LIVE_WS] Client connected');
    const apiKey = (
      process.env.MY_REALTIME_GEMINI_KEY ||
      process.env.VITE_MY_REALTIME_GEMINI_KEY ||
      process.env.NEXT_PUBLIC_MY_REALTIME_GEMINI_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    )?.trim();

    if (!apiKey) {
      console.log('[LIVE_WS] No GEMINI_API_KEY present; notifying client to use hybrid voice/chat mode.');
      clientWs.send(
        JSON.stringify({
          type: 'status',
          status: 'ready_fallback',
          message: 'Connected to AI Tutor Gateway (Hybrid Mode)',
        })
      );

      clientWs.on('message', (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.type === 'ping') {
            clientWs.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // ignore
        }
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      let session: any = null;

      try {
        session = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction:
              'You are the warm, encouraging AI Learning Tutor for "MY LEARNING". You specialize in teaching English, German, and Somali. Answer concisely and clearly, adapting to the language the student speaks. When teaching vocabulary or grammar, explain simply and provide useful spoken examples.',
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ type: 'audio', audio }));
              }

              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
              }

              // Extract text transcript if provided
              const textPart = message.serverContent?.modelTurn?.parts?.find((p) => p.text)?.text;
              if (textPart) {
                clientWs.send(JSON.stringify({ type: 'text', text: textPart }));
              }
            },
            onclose: () => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'closed' }));
              }
            },
            onerror: (err) => {
              console.error('[GEMINI_LIVE_CALLBACK_ERROR]', err);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', error: String(err) }));
              }
            },
          },
        });
      } catch (connectErr) {
        console.warn('[GEMINI_LIVE_CONNECT_FALLBACK]', connectErr);
        // If gemini-3.8-live fails or is not supported in the current tier, notify client to use fallback
        clientWs.send(
          JSON.stringify({
            type: 'status',
            status: 'ready_fallback',
            message: 'Live session connected with standard AI synthesis',
          })
        );
        return;
      }

      clientWs.send(
        JSON.stringify({
          type: 'status',
          status: 'connected',
          model: 'gemini-3.8-live',
          message: 'Gemini Multimodal Live Session active',
        })
      );

      clientWs.on('message', (raw) => {
        try {
          const data = JSON.parse(raw.toString());

          if (data.audio && session) {
            session.sendRealtimeInput({
              audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (data.text && session) {
            session.sendRealtimeInput({
              text: data.text,
            });
          } else if (data.image && session) {
            session.sendRealtimeInput({
              video: {
                data: data.image,
                mimeType: data.mimeType || 'image/jpeg',
              },
            });
          } else if (data.type === 'ping') {
            clientWs.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (err) {
          console.error('[LIVE_WS_MESSAGE_ERROR]', err);
        }
      });

      clientWs.on('close', () => {
        console.log('[LIVE_WS] Client disconnected');
        if (session) {
          try {
            session.close();
          } catch {
            // ignore
          }
        }
      });
    } catch (outerErr) {
      console.error('[LIVE_WS_INIT_ERROR]', outerErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'error', error: String(outerErr) }));
      }
    }
  });

  console.log('[LIVE_WS] WebSocket server initialized on path /api/live');
}
