import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { ProviderLogo } from '../components/ProviderLogo';
import { api, type CreateBillRequest } from '../api/client';

const PROVIDERS = [
  'Comcast/Xfinity',
  'Spectrum',
  'AT&T',
  'Verizon',
  'Cox',
  'Optimum',
];

export function AddBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateBillRequest>({
    provider: '',
    currentRate: 0,
    accountNumber: '',
    planName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    if (!formData.currentRate || formData.currentRate <= 0) {
      newErrors.currentRate = 'Please enter a valid rate';
    }
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Please enter your account number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      const bill = await api.createBill(formData);
      navigate(`/bills/${bill.id}`);
    } catch (error) {
      console.error('Failed to create bill:', error);
      // For demo purposes, navigate with mock ID
      navigate('/bills/mock-1');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#888] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <h1 className="text-2xl font-bold mb-2">Add a New Bill</h1>
      <p className="text-[#888] mb-8">Enter your bill details to start tracking and negotiating</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setFormData({ ...formData, provider })}
                className={`p-4 rounded-xl border transition-all ${
                  formData.provider === provider
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-[#262626] bg-[#141414] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ProviderLogo provider={provider} />
                  {formData.provider === provider && (
                    <Check className="w-5 h-5 text-[#00ff88]" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.provider && (
            <p className="text-[#ff4444] text-sm mt-2">{errors.provider}</p>
          )}
        </div>

        {/* Current Rate */}
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="rate">
            Current Monthly Rate
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]">$</span>
            <input
              id="rate"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.currentRate || ''}
              onChange={(e) => setFormData({ ...formData, currentRate: parseFloat(e.target.value) })}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 pl-8 text-white placeholder-[#666] focus:outline-none focus:border-[#00ff88] transition-colors"
            />
          </div>
          {errors.currentRate && (
            <p className="text-[#ff4444] text-sm mt-2">{errors.currentRate}</p>
          )}
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="account">
            Account Number
          </label>
          <input
            id="account"
            type="text"
            placeholder="Enter your account number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00ff88] transition-colors"
          />
          {errors.accountNumber && (
            <p className="text-[#ff4444] text-sm mt-2">{errors.accountNumber}</p>
          )}
        </div>

        {/* Plan Name (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="plan">
            Plan Name <span className="text-[#666]">(optional)</span>
          </label>
          <input
            id="plan"
            type="text"
            placeholder="e.g., Performance Pro Internet"
            value={formData.planName || ''}
            onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00ff88] transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#00ff88] text-black py-3.5 rounded-xl font-medium hover:bg-[#00dd77] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Adding Bill...' : 'Add Bill'}
        </button>
      </form>
    </div>
  );
}
