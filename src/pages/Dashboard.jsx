import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { services, bookings, customers, fetchServices, fetchBookings, fetchCustomers, updateBooking, deleteBooking } = useStore();
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchCustomers();
  }, [fetchServices, fetchBookings, fetchCustomers]);

  // Calculations
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  
  const totalRevenue = bookings.reduce((acc, booking) => {
    const service = services.find(s => s.id === booking.serviceId);
    return acc + Number(booking.price || service?.price || 0);
  }, 0);

  const stats = [
    { label: 'Total Bookings', value: totalBookings, icon: 'event_note', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approval', value: pendingBookings, icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed Appointments', value: confirmedBookings, icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time business insights and recent activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-xl">download</span>
            Export Report
          </button>
          <Link to="/bookings" className="btn-primary">
            <span className="material-symbols-outlined text-xl">add</span>
            New Booking
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-pro p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Live
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 card-pro flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Appointments</h3>
            <Link to="/bookings" className="text-blue-600 text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 6).map((booking) => {
                  const service = services.find(s => s.id === booking.serviceId);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {booking.clientDetails?.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{booking.clientDetails?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{service?.title || 'Unknown Service'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-900 font-medium">{booking.date}</p>
                          <p className="text-slate-500 text-xs">{booking.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to="/bookings" className="p-1.5 text-slate-400 hover:text-blue-600">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>
                          <button onClick={() => deleteBooking(booking.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      No recent appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="card-pro flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">New Customers</h3>
            <Link to="/customers" className="text-blue-600 text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="p-6 space-y-6">
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {customer.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{customer.name}</p>
                  <p className="text-xs text-slate-500 truncate">{customer.email || customer.phone}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to="/customers" className="text-slate-400 hover:text-blue-600">
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  </Link>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm italic">
                No customers found.
              </div>
            )}
          </div>
          <div className="mt-auto p-6 bg-slate-50 rounded-b-xl border-t border-slate-100">
            <Link to="/customers" className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Add New Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
