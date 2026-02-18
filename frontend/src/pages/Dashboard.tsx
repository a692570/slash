import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Percent, Receipt, Plus, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { api, mockStats, mockNegotiations, type DashboardStats, type Negotiation } from '../api/client';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [negotiations] = useState<Negotiation[]>(mockNegotiations);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.log('Using mock data - API not available');
      }
    };
    
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-[#888]">Track your bill negotiations and savings</p>
        </div>
        <Link
          to="/add-bill"
          className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2.5 rounded-lg font-medium hover:bg-[#00dd77] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Active Negotiations"
          value={stats.activeNegotiations}
          icon={TrendingUp}
          color="warning"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={Percent}
          color="success"
        />
        <StatCard
          title="Bills Tracked"
          value={stats.billsTracked}
          icon={Receipt}
        />
      </div>

      {/* Recent Negotiations */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl">
        <div className="p-5 border-b border-[#262626] flex items-center justify-between">
          <h2 className="font-semibold">Recent Negotiations</h2>
          <Link to="/bills" className="text-sm text-[#888] hover:text-white flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-[#262626]">
          {negotiations.map((negotiation) => (
            <div key={negotiation.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#888]" />
                </div>
                <div>
                  <div className="font-medium">Bill #{negotiation.billId}</div>
                  <div className="text-sm text-[#888]">{formatDate(negotiation.createdAt)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {negotiation.status === 'success' && negotiation.monthlySavings && (
                  <div className="text-right">
                    <div className="text-[#00ff88] font-medium">
                      {formatCurrency(negotiation.monthlySavings)}/mo saved
                    </div>
                    <div className="text-sm text-[#888]">
                      {formatCurrency(negotiation.annualSavings!)}/year
                    </div>
                  </div>
                )}
                <StatusBadge status={negotiation.status} />
              </div>
            </div>
          ))}
          
          {negotiations.length === 0 && (
            <div className="p-8 text-center text-[#888]">
              No negotiations yet. Add a bill to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
