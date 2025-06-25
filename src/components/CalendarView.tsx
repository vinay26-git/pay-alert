
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Payment } from '@/pages/Index';

interface CalendarViewProps {
  payments: Payment[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ payments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPaymentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return payments.filter(payment => payment.dueDate === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-bold">{monthYear}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }, (_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayPayments = getPaymentsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-xl border-2 transition-all duration-200 ${
                    isToday 
                      ? 'border-blue-500 bg-blue-50' 
                      : dayPayments.length > 0 
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                        : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayPayments.slice(0, 2).map((payment, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full ${getStatusColor(payment.status)}`}
                        title={`${payment.serviceName} - ₹${payment.amount}`}
                      />
                    ))}
                    {dayPayments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayPayments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Payments */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Today's Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date();
            const todayPayments = getPaymentsForDate(today);
            
            if (todayPayments.length === 0) {
              return (
                <p className="text-gray-500 text-center py-8">No payments due today</p>
              );
            }

            return (
              <div className="space-y-3">
                {todayPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold">{payment.serviceName}</p>
                      <p className="text-sm text-gray-600">₹{payment.amount.toLocaleString()}</p>
                    </div>
                    <Badge className={`${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};
