
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { fetchAdSlots, fetchBookings, fetchPerformanceMetrics } from '@/services/supabaseService';
import { useQuery } from '@tanstack/react-query';

const AnalyticsPage: React.FC = () => {
  // Fetch ad slots and bookings data
  const { data: adSlots = [] } = useQuery({
    queryKey: ['adSlots'],
    queryFn: async () => {
      return await fetchAdSlots();
    }
  });
  
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return await fetchBookings();
    }
  });
  
  const { data: performanceMetrics = [] } = useQuery({
    queryKey: ['performanceMetrics'],
    queryFn: async () => {
      return await fetchPerformanceMetrics();
    }
  });
  
  // Count statistics
  const totalSlots = adSlots.length;
  const availableSlots = adSlots.filter(slot => slot.status === 'available').length;
  const bookedSlots = totalSlots - availableSlots;
  
  // Calculate monthly revenue for chart
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const month = new Date().getMonth() - 5 + i;
    const adjustedMonth = month < 0 ? month + 12 : month;
    const monthName = new Date(currentYear, adjustedMonth, 1).toLocaleString('default', { month: 'short' });
    
    // Filter bookings for this month
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === adjustedMonth && 
             booking.status === 'approved';
    });
    
    // Calculate revenue
    const revenue = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.slotDetails?.price || 0);
    }, 0);
    
    return { name: monthName, revenue };
  });
  
  // Slot status data for pie chart - matching the same format as AdminDashboard
  const slotStatusData = [
    { name: 'Available', value: availableSlots },
    { name: 'Booked', value: bookedSlots },
  ];
  
  // Pie chart colors - using the same colors as AdminDashboard
  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue from ad bookings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Slot Status</CardTitle>
            <CardDescription>Overview of ad slot inventory</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slotStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {slotStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Slots']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly booking statistics</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: 'Jan', bookings: 12 },
                  { name: 'Feb', bookings: 19 },
                  { name: 'Mar', bookings: 15 },
                  { name: 'Apr', bookings: 22 },
                  { name: 'May', bookings: 28 },
                  { name: 'Jun', bookings: 24 },
                ]} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Bookings']} />
                <Bar dataKey="bookings" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
