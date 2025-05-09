import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
  name: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const hasData = data && data.length > 0;
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center w-full text-gray-500">
              You'll see your sales chart when you make a sale
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart; 