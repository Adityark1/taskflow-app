import { useEffect, useState } from 'react';
// IMPORT AT THE TOP: Bring in your floating AI assistant component
import AiFloatingWidget from '../components/AiFloatingWidget';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    currentStreak: 0,
    criticalAlerts: 0,
    productivityIndex: 50,
    priorities: { high: 0, medium: 0, low: 0 },
    categoryMetrics: []
  });
  const [loading, setLoading] = useState(true);

  // 1. REUSABLE TRIGGER: Fetches fresh analytical values from your Express backend
  const fetchMetrics = () => {
    fetch('http://localhost:4000/api/dashboard/metrics')
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard metric fetch failed:", err);
        setLoading(false);
      });
  };

  // 2. Initial fetch when the application starts up + Global Real-Time Event Listener Sync
  useEffect(() => {
    fetchMetrics();

    // ⚡ REAL-TIME SYSTEM ENGINE SYNCHRONIZATION EAR
    const handleSystemBroadcast = (event) => {
      console.log(`📊 Dashboard metrics intercepting operational broadcast: ${event.detail?.action}`);
      fetchMetrics(); // Re-fetch all priority scores, streaks, and counter grids instantly
    };

    window.addEventListener('taskflow-db-update', handleSystemBroadcast);
    return () => {
      window.removeEventListener('taskflow-db-update', handleSystemBroadcast);
    };
  }, []);

  if (loading) {
    return <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px', fontWeight: '600' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '80vh', paddingBottom: '60px' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '800', background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Dashboard
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>An overview of your current progress and active tasks.</p>
      </div>

      {/* CORE METRIC GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={cardWrapperStyle}>
          <p style={cardLabelStyle}>Total Tasks</p>
          <h3 style={cardValueStyle}>{metrics.totalTasks}</h3>
        </div>
        <div style={cardWrapperStyle}>
          <p style={cardLabelStyle}>Completion Rate</p>
          <h3 style={{ ...cardValueStyle, color: '#10b981' }}>{metrics.completionRate}%</h3>
        </div>
        <div style={cardWrapperStyle}>
          <p style={cardLabelStyle}>Pending Tasks</p>
          <h3 style={{ ...cardValueStyle, color: '#f59e0b' }}>{metrics.pendingTasks}</h3>
        </div>
        <div style={cardWrapperStyle}>
          <p style={cardLabelStyle}>🔥 Current Streak</p>
          <h3 style={{ ...cardValueStyle, color: '#ff6b6b' }}>{metrics.currentStreak} Days</h3>
        </div>
      </div>

      {/* HEALTH & INDEX ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        
        {/* PRODUCTIVITY INDEX */}
        <div style={{ ...cardWrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={sectionHeadingStyle}>Productivity Score</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Based on how fast you close high-priority items.</p>
          </div>
          <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', border: '2px dashed #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>{metrics.productivityIndex}</span>
          </div>
        </div>

        {/* OVERDUE ALERTS */}
        <div style={{ ...cardWrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={sectionHeadingStyle}>Overdue Tasks</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>High priority items that need immediate attention.</p>
          </div>
          <div style={{ background: metrics.criticalAlerts > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '12px 24px', borderRadius: '16px', border: `1px solid ${metrics.criticalAlerts > 0 ? '#ef4444' : '#10b981'}` }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: metrics.criticalAlerts > 0 ? '#ef4444' : '#10b981' }}>{metrics.criticalAlerts} Alerts</span>
          </div>
        </div>

      </div>

      {/* DISTRIBUTION MATRICES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={cardWrapperStyle}>
          <h4 style={sectionHeadingStyle}>Tasks by Priority</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            <div>
              <div style={rowLabelFlex}><span style={{ color: '#ef4444', fontWeight: '700' }}>🔴 High</span><span>{metrics.priorities.high} tasks</span></div>
              <div style={progressBarContainer}><div style={{ ...progressBarFill, width: `${metrics.totalTasks > 0 ? (metrics.priorities.high / metrics.totalTasks) * 100 : 0}%`, background: '#ef4444' }} /></div>
            </div>
            <div>
              <div style={rowLabelFlex}><span style={{ color: '#f59e0b', fontWeight: '700' }}>🟡 Medium</span><span>{metrics.priorities.medium} tasks</span></div>
              <div style={progressBarContainer}><div style={{ ...progressBarFill, width: `${metrics.totalTasks > 0 ? (metrics.priorities.medium / metrics.totalTasks) * 100 : 0}%`, background: '#f59e0b' }} /></div>
            </div>
            <div>
              <div style={rowLabelFlex}><span style={{ color: '#3b82f6', fontWeight: '700' }}>🔵 Low</span><span>{metrics.priorities.low} tasks</span></div>
              <div style={progressBarContainer}><div style={{ ...progressBarFill, width: `${metrics.totalTasks > 0 ? (metrics.priorities.low / metrics.totalTasks) * 100 : 0}%`, background: '#3b82f6' }} /></div>
            </div>
          </div>
        </div>

        <div style={cardWrapperStyle}>
          <h4 style={sectionHeadingStyle}>Tasks by Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', maxHeight: '180px', overflowY: 'auto' }}>
            {metrics.categoryMetrics.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', marginTop: '30px' }}>No categories created yet.</p>
            ) : (
              metrics.categoryMetrics.map((cat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.3)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '600' }}>{cat.category || 'General'}</span>
                  <span style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>{cat.count} Tasks</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MOUNTED COMPONENT: The AI button and system slider panel */}
      {/* We pass the fetchMetrics function down as the onRefreshDashboard hook */}
      <AiFloatingWidget onRefreshDashboard={fetchMetrics} />

    </div>
  );
}

// Keeping all of your core component styles completely untouched
const cardWrapperStyle = { background: 'rgba(30, 41, 59, 0.25)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '24px', padding: '24px 28px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)' };
const cardLabelStyle = { color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };
const cardValueStyle = { color: '#ffffff', fontSize: '2.2rem', fontWeight: '800' };
const sectionHeadingStyle = { color: '#ffffff', fontSize: '1.1rem', fontWeight: '700' };
const rowLabelFlex = { display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' };
const progressBarContainer = { width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' };
const progressBarFill = { height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' };