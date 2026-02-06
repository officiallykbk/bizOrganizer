import React from 'react';
import Layout from '../components/layout/Layout';
import StatsOverview from '../components/statistics/StatsOverview';
import FinancialMetrics from '../components/statistics/FinancialMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ExportButton from '../components/data/ExportButton';

const Statistics: React.FC = () => {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistics &amp; Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track business performance and financial metrics
          </p>
        </div>
        <ExportButton />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white rounded-lg shadow p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <StatsOverview />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialMetrics />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Statistics;