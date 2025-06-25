
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { Payment } from '@/pages/Index';

interface BudgetTrackerProps {
  payments: Payment[];
  categories: Array<{ id: string; name: string; icon: any; color: string }>;
}

interface Budget {
  categoryId: string;
  limit: number;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ payments, categories }) => {
  const [budgets, setBudgets] = useState<Budget[]>([
    { categoryId: 'ott-subscriptions', limit: 2000 },
    { categoryId: 'utility-bills', limit: 5000 },
    { categoryId: 'credit-cards', limit: 20000 },
  ]);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: '', limit: '' });

  const getCategorySpending = (categoryId: string) => {
    return payments
      .filter(p => p.category === categoryId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getTotalSpending = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.limit, 0);
  };

  const addBudget = () => {
    if (!newBudget.categoryId || !newBudget.limit) return;
    
    const budget: Budget = {
      categoryId: newBudget.categoryId,
      limit: parseFloat(newBudget.limit)
    };
    
    setBudgets([...budgets.filter(b => b.categoryId !== budget.categoryId), budget]);
    setNewBudget({ categoryId: '', limit: '' });
    setIsAddingBudget(false);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const totalSpending = getTotalSpending();
  const totalBudget = getTotalBudget();
  const totalProgress = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Monthly Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Spending</span>
              <span className="text-2xl font-bold">₹{totalSpending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Budget Limit</span>
              <span>₹{totalBudget.toLocaleString()}</span>
            </div>
            <Progress 
              value={Math.min(totalProgress, 100)} 
              className="h-3 rounded-full"
            />
            <div className="flex justify-between text-sm">
              <span>{totalProgress.toFixed(1)}% used</span>
              <span className={totalProgress > 100 ? 'text-red-600' : 'text-green-600'}>
                ₹{Math.abs(totalBudget - totalSpending).toLocaleString()} 
                {totalProgress > 100 ? ' over budget' : ' remaining'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category Budgets</CardTitle>
          <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Set Category Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full p-3 border rounded-xl mt-2"
                    value={newBudget.categoryId}
                    onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter(cat => !budgets.find(b => b.categoryId === cat.id))
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label>Monthly Limit (₹)</Label>
                  <Input
                    type="number"
                    value={newBudget.limit}
                    onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                    placeholder="5000"
                    className="rounded-xl"
                  />
                </div>
                <Button onClick={addBudget} className="w-full rounded-xl">
                  Set Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.map((budget) => {
            const category = categories.find(c => c.id === budget.categoryId);
            const spent = getCategorySpending(budget.categoryId);
            const percentage = (spent / budget.limit) * 100;
            const status = getBudgetStatus(spent, budget.limit);
            const IconComponent = category?.icon;

            return (
              <div key={budget.categoryId} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {IconComponent && (
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-semibold">{category?.name}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`${
                      status.status === 'exceeded' ? 'border-red-500 text-red-700' :
                      status.status === 'warning' ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }`}
                  >
                    {status.status === 'exceeded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>₹{spent.toLocaleString()} spent</span>
                    <span>₹{budget.limit.toLocaleString()} limit</span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  {percentage > 100 && (
                    <p className="text-red-600 text-sm font-medium">
                      ₹{(spent - budget.limit).toLocaleString()} over budget!
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No budgets set yet</p>
              <p className="text-sm">Add budgets to track your spending</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const spending = getCategorySpending(category.id);
              if (spending === 0) return null;
              
              const percentage = totalSpending > 0 ? (spending / totalSpending) * 100 : 0;
              const IconComponent = category.icon;

              return (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{spending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
