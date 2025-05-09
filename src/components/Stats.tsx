import React from 'react';

interface Stat {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface StatsProps {
  stats: Stat[];
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
            </div>
            <div className="p-2 rounded-full bg-gray-50">
              {stat.icon}
            </div>
          </div>
          
          <div className="mt-3 flex items-center text-sm">
            <span
              className={`inline-flex items-center ${
                stat.changeType === 'positive'
                  ? 'text-success-600'
                  : stat.changeType === 'negative'
                  ? 'text-danger-600'
                  : 'text-gray-600'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-gray-500 mr-1">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;