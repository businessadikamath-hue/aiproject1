import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '../types';

// Vercel Edge Functions are fast, but have some restrictions.
// We are using the Edge runtime to support streaming.
export const config = {
  runtime: 'edge',
};

// The handler function is the entry point for the serverless function.
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Ensure the API key is set as an environment variable on Vercel
  if (!process.env.API_KEY) {
    return new Response('API_KEY environment variable not set', { status: 500 });
  }

  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('No user message found in the request', { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Reconstruct the chat history from the messages array
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      config: {
        systemInstruction: 'You are a helpful and friendly assistant. Keep your responses concise and easy to read.',
      },
    });

    const responseStream = await chat.sendMessageStream({ message: lastMessage.content });

    // Create a new readable stream to send the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            // Encode the text chunk and enqueue it in the stream
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        // Close the stream when all chunks have been sent
        controller.close();
      },
    });

    // Return the stream as the response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error in chat handler:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}