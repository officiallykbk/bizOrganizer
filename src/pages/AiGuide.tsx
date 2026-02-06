import React from 'react';
import Layout from '../components/layout/Layout';
import AiAssistant from '../components/ai-guide/AiAssistant';

const AiGuide: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Business Guide</h1>
        <p className="text-gray-600 mt-1">
          Get real-time insights and analysis about your business performance
        </p>
      </div>
      
      <AiAssistant />
    </Layout>
  );
};

export default AiGuide;