import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Send, Copy, Check, RefreshCw, RotateCw } from 'lucide-react';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyDGZYGwaaU82fOkMFyH641K9cHfrjH_y_U');

function App() {
  const [userInput, setUserInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [enhancementCount, setEnhancementCount] = useState(0);

  const resetPage = () => {
    setUserInput('');
    setEnhancedPrompt('');
    setError('');
    setCopied(false);
    setEnhancementCount(0);
  };

  const generateEnhancedPrompt = async (inputPrompt: string) => {
    setIsLoading(true);
    setError('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Given this prompt: "${inputPrompt}"
      Please enhance it to be more detailed and specific, considering:
      1. Add more context and specific details
      2. Include any relevant parameters or constraints
      3. Make it more descriptive and clear
      4. Ensure it guides towards high-quality output
      ${enhancementCount > 0 ? '5. Further refine and expand upon the existing enhancements' : ''}
      
      Provide only the enhanced prompt without any explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('No response received from AI');
      }
      
      setEnhancedPrompt(text);
      setEnhancementCount(prev => prev + 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(`Failed to generate prompt: ${errorMessage}. Please check your API key and try again.`);
      console.error('Error generating prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialEnhance = () => {
    if (!userInput.trim()) return;
    generateEnhancedPrompt(userInput);
  };

  const handleFurtherEnhance = () => {
    if (!enhancedPrompt) return;
    generateEnhancedPrompt(enhancedPrompt);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Prompt Enhancer</h1>
          </div>
          <p className="text-gray-600">Transform your simple ideas into detailed, powerful prompts</p>
        </header>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={resetPage}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Page
            </button>
          </div>

          <div className="mb-6">
            <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your basic prompt
            </label>
            <div className="flex gap-2">
              <input
                id="userPrompt"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="e.g., Create a logo for a coffee shop"
              />
              <button
                onClick={handleInitialEnhance}
                disabled={isLoading || !userInput.trim()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Enhance
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Enhancing your prompt...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {enhancedPrompt && !isLoading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Enhanced Prompt:</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleFurtherEnhance}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
                  >
                    <RotateCw className="w-4 h-4 text-purple-600" />
                    <span>Enhance Further</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-gray-800 whitespace-pre-wrap">{enhancedPrompt}</p>
              </div>
              {enhancementCount > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Enhancement level: {enhancementCount}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
