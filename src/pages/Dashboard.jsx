import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

const SMOKY_ROSE = '#86626E';
const THISTLE = '#E7C8DD';

export default function Dashboard() {
  const { services, bookings, customers, fetchServices, fetchBookings, fetchCustomers, deleteBooking } = useStore();

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchCustomers();
  }, [fetchServices, fetchBookings, fetchCustomers]);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  // Revenue ONLY from confirmed bookings
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc, booking) => {
      return acc + Number(booking.totalPrice || booking.price || 0);
    }, 0);

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: 'event_note',
      iconBg: THISTLE,
      iconColor: SMOKY_ROSE,
    },
    {
      label: 'Pending Approval',
      value: pendingBookings,
      icon: 'pending_actions',
      iconBg: '#fef3c7',
      iconColor: '#92400e',
    },
    {
      label: 'Confirmed Appointments',
      value: confirmedBookings,
      icon: 'verified',
      iconBg: '#d1fae5',
      iconColor: '#065f46',
    },
    {
      label: 'Total Revenue',
      value: `PKR ${totalRevenue.toLocaleString()}`,
      icon: 'payments',
      iconBg: '#E7C8DD',
      iconColor: '#86626E',
      note: 'Confirmed only',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#2d1f24' }}>Dashboard Overview</h1>
          <p className="text-sm mt-1" style={{ color: '#7a5a62' }}>Real-time business insights and recent activities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button className="btn-secondary flex-1 sm:flex-none py-2 px-4 text-xs sm:text-sm">
            <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
            Export Report
          </button>
          <Link to="/bookings" className="btn-primary flex-1 sm:flex-none py-2 px-4 text-xs sm:text-sm">
            <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
            New Booking
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-pro p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.iconBg }}>
                <span className="material-symbols-outlined text-xl sm:text-2xl" style={{ color: stat.iconColor }}>
                  {stat.icon}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: THISTLE, color: SMOKY_ROSE }}>
                <span className="material-symbols-outlined text-xs sm:text-sm">trending_up</span>
                Live
              </span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: '#7a5a62' }}>
                {stat.label}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: '#2d1f24' }}>{stat.value}</h3>
              {stat.note && (
                <p className="text-[10px] mt-1 font-medium" style={{ color: '#9e7a86' }}>{stat.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 card-pro flex flex-col">
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(200,154,173,0.3)' }}>
            <h3 className="font-bold" style={{ color: '#2d1f24' }}>Recent Appointments</h3>
            <Link to="/bookings" className="text-xs font-bold hover:underline" style={{ color: SMOKY_ROSE }}>View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider font-bold" style={{ backgroundColor: '#E7C8DD' }}>
                  <th className="px-6 py-4" style={{ color: SMOKY_ROSE }}>Client</th>
                  <th className="px-6 py-4" style={{ color: SMOKY_ROSE }}>Service</th>
                  <th className="px-6 py-4" style={{ color: SMOKY_ROSE }}>Date</th>
                  <th className="px-6 py-4" style={{ color: SMOKY_ROSE }}>Status</th>
                  <th className="px-6 py-4 text-right" style={{ color: SMOKY_ROSE }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(200,154,173,0.2)' }}>
                {bookings.slice(0, 6).map((booking) => {
                  const service = services.find(s => s.id === booking.serviceId);
                  return (
                    <tr key={booking.id} className="hover:bg-[#E7C8DD]/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: THISTLE, color: SMOKY_ROSE }}>
                            {booking.clientDetails?.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#2d1f24' }}>{booking.clientDetails?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium" style={{ color: '#7a5a62' }}>
                          {booking.serviceName || service?.title || 'Unknown Service'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium" style={{ color: '#2d1f24' }}>{booking.date}</p>
                          <p className="text-xs" style={{ color: '#7a5a62' }}>{booking.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge-${booking.status}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to="/bookings" className="p-1.5 transition-colors" style={{ color: '#c89aad' }}
                    onMouseEnter={e => e.currentTarget.style.color='#86626E'}
                    onMouseLeave={e => e.currentTarget.style.color='#c89aad'}>
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                          <button onClick={() => deleteBooking(booking.id)} className="p-1.5 text-rose-400 hover:text-rose-600">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm italic" style={{ color: '#9e7a86' }}>
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
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(200,154,173,0.3)' }}>
            <h3 className="font-bold" style={{ color: '#2d1f24' }}>New Customers</h3>
            <Link to="/customers" className="text-xs font-bold hover:underline" style={{ color: SMOKY_ROSE }}>View All</Link>
          </div>
          <div className="p-6 space-y-6">
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{ backgroundColor: THISTLE, color: SMOKY_ROSE }}>
                  {customer.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#2d1f24' }}>{customer.name}</p>
                  <p className="text-xs truncate" style={{ color: '#7a5a62' }}>{customer.phone || customer.email || '—'}</p>
                </div>
                <Link to="/customers" style={{ color: '#c89aad' }} className="hover:text-[#86626E]">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                </Link>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="py-10 text-center text-sm italic" style={{ color: '#9e7a86' }}>
                No customers found.
              </div>
            )}
          </div>
          <div className="mt-auto p-6 rounded-b-xl border-t" style={{ backgroundColor: THISTLE, borderColor: '#c89aad' }}>
            <Link to="/customers" className="w-full btn-primary text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Add New Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
