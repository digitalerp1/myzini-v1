import React, { useState, useEffect, useRef } from 'react';
import { startChatWithHistory } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { Chat, Content } from '@google/genai';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string; // base64 data URL
}

const QueryHelper: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [input, setInput] = useState('');
    const [image, setImage] = useState<{b64: string, mimeType: string, url: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            setChat(startChatWithHistory());
        } catch (e: any) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const fileToBase64 = (file: File): Promise<{b64: string, mimeType: string, url: string}> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const b64 = result.split(',')[1];
                resolve({ b64, mimeType: file.type, url: result });
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const imageData = await fileToBase64(file);
                setImage(imageData);
            } catch (err) {
                setError("Failed to read image file.");
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() && !image) return;
        if (!chat) {
            setError("Chat is not initialized.");
            return;
        }

        setLoading(true);
        setError('');
        
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            ...(image && { image: image.url }),
        };
        setMessages(prev => [...prev, userMessage]);

        const messageParts = [];
        if (image) {
            messageParts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.b64
                }
            });
        }
        if (input.trim()) {
            messageParts.push({ text: input });
        }
        
        setInput('');
        setImage(null);

        try {
            const responseStream = await chat.sendMessageStream(messageParts);
            
            let modelResponse = '';
            const modelMessageId = Date.now().toString();

            // Add a placeholder for the model's response
            setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '...' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg
                ));
            }

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error.'}]);
        } finally {
            setLoading(false);
        }
    };

    const renderMarkdown = (text: string) => {
         return text
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code class="bg-gray-200 text-red-600 px-1 rounded text-sm">$1</code>')
            .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800 text-center">AI Query Helper</h1>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-xl p-3 max-w-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {msg.image && <img src={msg.image} alt="uploaded content" className="rounded-lg mb-2 max-h-48" />}
                            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) || '&nbsp;' }} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-3">
                        <div className="rounded-xl p-3 max-w-lg bg-gray-100 text-gray-800 flex items-center">
                            <Spinner size="5" />
                            <span className="ml-2">Thinking...</span>
                        </div>
                    </div>
                )}
                 {error && (
                    <div className="p-4 text-sm bg-red-100 text-red-700 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleSubmit} className="relative">
                     {image && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border rounded-lg shadow-sm">
                            <img src={image.url} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                            <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">&times;</button>
                        </div>
                    )}
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-primary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </button>
                        <textarea
                            rows={1}
                            className="flex-grow p-3 bg-transparent border-none focus:ring-0 resize-none"
                            placeholder="Ask a question or upload an image..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                        />
                        <button type="submit" disabled={loading} className="p-3 text-gray-500 hover:text-primary disabled:text-gray-300">
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QueryHelper;