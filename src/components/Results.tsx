import React, { useState } from 'react';
import { Copy, CheckCircle2, ArrowLeft, Sparkles, Lightbulb, Edit3 } from 'lucide-react';

interface ResultsProps {
  results: string[];
  onNewQuery: () => void;
  mode: 'generate' | 'optimize';
}

const Results: React.FC<ResultsProps> = ({ results, onNewQuery, mode }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getHeaderInfo = () => {
    if (mode === 'generate') {
      return {
        icon: <Lightbulb className="w-8 h-8 text-white" />,
        title: 'Generated Content',
        subtitle: 'Fresh LinkedIn post ideas and content'
      };
    } else {
      return {
        icon: <Edit3 className="w-8 h-8 text-white" />,
        title: 'Optimized Versions',
        subtitle: 'Improved versions of your LinkedIn post'
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            {headerInfo.icon}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{headerInfo.title}</h2>
          <p className="text-gray-600">{headerInfo.subtitle}</p>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 mb-8">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
              onClick={() => copyToClipboard(result, index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="text-sm font-semibold text-blue-600 mb-3">
                    {mode === 'generate' ? `Idea ${index + 1}` : `Version ${index + 1}`}
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{result}</p>
                </div>
                <div className="flex-shrink-0">
                  {copiedIndex === index ? (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Copied!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400 group-hover:text-blue-600 bg-gray-50 group-hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200">
                      <Copy className="w-4 h-4" />
                      <span className="text-sm font-medium">Copy</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewQuery}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>{mode === 'generate' ? 'Generate More' : 'Try Another Post'}</span>
          </button>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          {results.length} {mode === 'generate' ? 'idea' : 'version'}{results.length !== 1 ? 's' : ''} generated • Click any card to copy • @ReachLinkAI 2025 All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default Results;