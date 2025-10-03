
import React, { useState } from 'react';
import { getInsightsFromGemini } from '../services/geminiService';
import Spinner from '../components/Spinner';
import QueryIcon from '../components/icons/QueryIcon';

const QueryHelper: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult('');

        try {
            const response = await getInsightsFromGemini(query);
            setResult(response);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Simple markdown-to-HTML conversion
    const renderMarkdown = (text: string) => {
        return text
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code class="bg-gray-200 text-red-600 px-1 rounded">$1</code>')
            .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">AI Query Helper</h1>
            <p className="mt-2 text-gray-600">Ask a question in plain English about your school's data and get an instant summary.</p>
            
            <form onSubmit={handleSubmit} className="mt-6">
                <label htmlFor="query" className="block text-sm font-medium text-gray-700">Your Question</label>
                <textarea
                    id="query"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="e.g., 'How many students are in class 10?' or 'List all staff with salaries over 50,000'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 px-6 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors"
                >
                    {loading ? <Spinner size="5" /> : <QueryIcon />}
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700">AI Response</h2>
                {loading && (
                    <div className="flex justify-center items-center h-40 border-2 border-dashed border-gray-200 rounded-lg mt-2">
                        <Spinner size="10"/>
                    </div>
                )}
                {error && (
                    <div className="mt-2 p-4 text-sm bg-red-100 text-red-700 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {result && !loading && (
                    <div className="mt-2 p-6 prose max-w-none bg-gray-50 border border-gray-200 rounded-lg"
                         dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}>
                    </div>
                )}
                {!result && !loading && !error && (
                    <div className="mt-2 flex items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500">The AI's response will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryHelper;
