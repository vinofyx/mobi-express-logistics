import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const [stats, setStats] = useState({
    pickupsToday: 24,
    parcelsAtCenter: 147,
    activeShipments: 38,
    failedPickups: 3
  });

  const [pickupRequests, setPickupRequests] = useState([
    {
      id: 1,
      customer: 'John Doe',
      time: '09:30 AM',
      agent: 'Not Assigned',
      status: 'requested'
    },
    {
      id: 2,
      customer: 'Jane Smith',
      time: '10:15 AM',
      agent: 'Mike Wilson',
      status: 'assigned'
    },
    {
      id: 3,
      customer: 'Bob Johnson',
      time: '11:45 AM',
      agent: 'Sarah Davis',
      status: 'picked'
    },
    {
      id: 4,
      customer: 'Alice Brown',
      time: '02:30 PM',
      agent: 'Tom Harris',
      status: 'failed'
    }
  ]);

  const [parcelStatus, setParcelStatus] = useState([
    { label: 'Received', value: 89, color: 'bg-blue' },
    { label: 'Sorted', value: 67, color: 'bg-purple' },
    { label: 'Dispatched', value: 45, color: 'bg-success' },
    { label: 'In Transit', value: 23, color: 'bg-warning' },
    { label: 'Damaged', value: 2, color: 'bg-danger' }
  ]);

  const [activeShipments, setActiveShipments] = useState([
    {
      id: 'SHP001',
      route: 'New York → Los Angeles',
      parcels: 12,
      eta: '2024-01-18',
      status: 'in_transit'
    },
    {
      id: 'SHP002',
      route: 'Chicago → Miami',
      parcels: 8,
      eta: '2024-01-19',
      status: 'dispatched'
    },
    {
      id: 'SHP003',
      route: 'Seattle → Boston',
      parcels: 15,
      eta: '2024-01-17',
      status: 'delivered'
    }
  ]);

  const [fieldAgents, setFieldAgents] = useState([
    {
      id: 1,
      name: 'Mike Wilson',
      status: 'active',
      progress: 75,
      avatar: 'MW'
    },
    {
      id: 2,
      name: 'Sarah Davis',
      status: 'busy',
      progress: 45,
      avatar: 'SD'
    },
    {
      id: 3,
      name: 'Tom Harris',
      status: 'offline',
      progress: 0,
      avatar: 'TH'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      status: 'active',
      progress: 90,
      avatar: 'LC'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const StatCard = ({ title, value, icon, accent, delta, deltaType }) => (
    <div className="bg-surface1 border border radius-lg p-md relative overflow-hidden fade-up-delayed-1">
      {/* Bottom Accent Line */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1 ${accent}`}
      ></div>
      
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          {/* Icon */}
          <div 
            className={`w-12 h-12 ${accent} radius-lg flex items-center justify-center text-2xl text-white`}
          >
            {icon}
          </div>
          
          {/* Content */}
          <div>
            <div className="text-3xl font-bold text-primary">{value}</div>
            <div className="text-sm text-muted">{title}</div>
          </div>
        </div>
        
        {/* Delta Badge */}
        {delta && (
          <div className={`badge px-xs py-1 text-xs font-medium ${
            deltaType === 'up' ? 'badge-success' : 'badge-danger'
          }`}>
            {deltaType === 'up' ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      
      {/* Glow Blob */}
      <div 
        className="absolute w-24 h-24 rounded-full opacity-20 -top-4 -right-4"
        style={{
          background: `radial-gradient(circle, ${accent.replace('bg-', 'rgba(').replace(')', ', ', 0.3) 0%, transparent 70%)`,
        }}
      ></div>
    </div>
  );

  const pickupColumns = [
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'agent', label: 'Agent', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (status) => <StatusBadge status={status} size="sm" /> }
  ];

  const shipmentColumns = [
    { key: 'id', label: 'Shipment ID', sortable: true, render: (id) => <span className="font-mono text-blue">{id}</span> },
    { key: 'route', label: 'Route', sortable: true },
    { key: 'parcels', label: 'Parcels', sortable: true },
    { key: 'eta', label: 'ETA', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (status) => <StatusBadge status={status} size="sm" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-md"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted">Real-time logistics monitoring</p>
        </div>
        <button className="btn-primary">
          <svg className="w-4 h-4 mr-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Pickup
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-md mb-xl">
        <StatCard
          title="Pickups Today"
          value={stats.pickupsToday}
          icon="🚚"
          accent="bg-blue"
          delta={12}
          deltaType="up"
        />
        <StatCard
          title="Parcels at Centre"
          value={stats.parcelsAtCenter}
          icon="📦"
          accent="bg-purple"
          delta={-5}
          deltaType="down"
        />
        <StatCard
          title="Active Shipments"
          value={stats.activeShipments}
          icon="🚢"
          accent="bg-success"
          delta={8}
          deltaType="up"
        />
        <StatCard
          title="Failed Pickups"
          value={stats.failedPickups}
          icon="⚠️"
          accent="bg-danger"
          delta={2}
          deltaType="up"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-3 gap-md mb-xl">
        {/* Recent Pickup Requests */}
        <div className="col-span-2 space-y-lg">
          <div className="bg-surface1 border border radius-lg p-lg">
            <h2 className="text-lg font-semibold text-primary mb-md">Recent Pickup Requests</h2>
            <DataTable
              data={pickupRequests}
              columns={pickupColumns}
              emptyMessage="No pickup requests"
              className="border-0"
            />
          </div>
        </div>

        {/* Parcel Status */}
        <div className="space-y-lg">
          <div className="bg-surface1 border border radius-lg p-lg">
            <h2 className="text-lg font-semibold text-primary mb-md">Parcel Status</h2>
            <div className="space-y-sm">
              {parcelStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-sm text-muted">{item.label}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">{item.value}</div>
                </div>
              ))}
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-xs mt-md">
              {parcelStatus.map((item, index) => (
                <div key={index} className="flex items-center gap-sm">
                  <span className="text-xs text-muted w-16">{item.label}</span>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${item.color}`}
                        style={{ width: `${(item.value / 150) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-3 gap-md">
        {/* Active Shipments */}
        <div className="col-span-2 space-y-lg">
          <div className="bg-surface1 border border radius-lg p-lg">
            <h2 className="text-lg font-semibold text-primary mb-md">Active Shipments</h2>
            <DataTable
              data={activeShipments}
              columns={shipmentColumns}
              emptyMessage="No active shipments"
              className="border-0"
            />
          </div>
        </div>

        {/* Field Agents Today */}
        <div className="space-y-lg">
          <div className="bg-surface1 border border radius-lg p-lg">
            <h2 className="text-lg font-semibold text-primary mb-md">Field Agents Today</h2>
            <div className="space-y-sm">
              {fieldAgents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-sm p-sm border border radius-md hover:bg-surface2 transition-normal">
                  {/* Avatar */}
                  <div 
                    className={`w-8 h-8 radius-full flex items-center justify-center text-white text-sm font-bold ${
                      agent.status === 'active' ? 'bg-success' :
                      agent.status === 'busy' ? 'bg-warning' : 'bg-muted'
                    }`}
                  >
                    {agent.avatar}
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-primary">{agent.name}</div>
                        <StatusBadge status={agent.status} size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill bg-blue"
                        style={{ width: `${agent.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
