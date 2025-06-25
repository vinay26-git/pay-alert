
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/PaymentModal';
import { CalendarView } from '@/components/CalendarView';
import { BudgetTracker } from '@/components/BudgetTracker';
import { 
  Plus, 
  CreditCard, 
  Tv, 
  PiggyBank, 
  Lightbulb, 
  Smartphone, 
  Car, 
  Home, 
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  Bell,
  ExternalLink
} from 'lucide-react';

export interface Payment {
  id: string;
  serviceName: string;
  category: string;
  dueDate: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  paymentLink?: string;
  status: 'paid' | 'upcoming' | 'overdue';
  notes?: string;
}

const categories = [
  { id: 'credit-cards', name: 'Credit Cards', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'ott-subscriptions', name: 'OTT Subscriptions', icon: Tv, color: 'bg-purple-500' },
  { id: 'loan-emis', name: 'Loan EMIs', icon: PiggyBank, color: 'bg-green-500' },
  { id: 'utility-bills', name: 'Utility Bills', icon: Lightbulb, color: 'bg-yellow-500' },
  { id: 'mobile-recharge', name: 'Mobile Recharge', icon: Smartphone, color: 'bg-orange-500' },
  { id: 'fastag', name: 'FASTag', icon: Car, color: 'bg-indigo-500' },
  { id: 'rent', name: 'Rent', icon: Home, color: 'bg-red-500' },
  { id: 'insurance', name: 'Insurance', icon: Shield, color: 'bg-teal-500' },
];

const PayAlert = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'budget'>('dashboard');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Sample data
  useEffect(() => {
    const samplePayments: Payment[] = [
      {
        id: '1',
        serviceName: 'Netflix Premium',
        category: 'ott-subscriptions',
        dueDate: '2025-06-28',
        amount: 799,
        frequency: 'monthly',
        status: 'upcoming',
        paymentLink: 'https://netflix.com/billing'
      },
      {
        id: '2',
        serviceName: 'HDFC Credit Card',
        category: 'credit-cards',
        dueDate: '2025-06-30',
        amount: 15000,
        frequency: 'monthly',
        status: 'upcoming'
      },
      {
        id: '3',
        serviceName: 'Home Loan EMI',
        category: 'loan-emis',
        dueDate: '2025-06-23',
        amount: 45000,
        frequency: 'monthly',
        status: 'overdue'
      },
      {
        id: '4',
        serviceName: 'Electricity Bill',
        category: 'utility-bills',
        dueDate: '2025-06-20',
        amount: 2500,
        frequency: 'monthly',
        status: 'paid'
      }
    ];
    setPayments(samplePayments);
  }, []);

  const addPayment = (payment: Omit<Payment, 'id' | 'status'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      status: new Date(payment.dueDate) < new Date() ? 'overdue' : 'upcoming'
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (updatedPayment: Payment) => {
    setPayments(payments.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const upcomingAmount = payments.filter(p => p.status === 'upcoming').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">PayAlert</h1>
        <p className="text-blue-100">Smart payment tracking & management</p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4" />
              <span className="text-sm">Upcoming</span>
            </div>
            <p className="text-xl font-bold">₹{upcomingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Overdue</span>
            </div>
            <p className="text-xl font-bold text-red-200">₹{overdueAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveView('dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'outline'}
            onClick={() => setActiveView('calendar')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={activeView === 'budget' ? 'default' : 'outline'}
            onClick={() => setActiveView('budget')}
            className="flex-1"
          >
            Budget
          </Button>
        </div>

        {/* Content */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Add Payment Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Payment
            </Button>

            {/* Payments List */}
            <div className="space-y-4">
              {payments.map((payment) => {
                const categoryInfo = getCategoryInfo(payment.category);
                const IconComponent = categoryInfo.icon;
                
                return (
                  <Card 
                    key={payment.id} 
                    className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-0 rounded-2xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${categoryInfo.color} text-white`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{payment.serviceName}</h3>
                            <p className="text-gray-600">{categoryInfo.name}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(payment.status)} border`}>
                          {payment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {payment.paymentLink && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(payment.paymentLink, '_blank')}
                              className="rounded-xl"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsModalOpen(true);
                            }}
                            className="rounded-xl"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'calendar' && <CalendarView payments={payments} />}
        {activeView === 'budget' && <BudgetTracker payments={payments} categories={categories} />}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        onSave={selectedPayment ? updatePayment : addPayment}
        categories={categories}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PayAlert;
