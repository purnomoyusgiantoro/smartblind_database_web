import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Database, 
  Lock, 
  User, 
  LayoutDashboard, 
  MessageSquare,
  AlertTriangle,
  Settings, 
  LogOut, 
  Activity,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'overview';
  }); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [stats, setStats] = useState({ logsCount: 0, aiCount: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      checkConnection();
      fetchStats();
      if (activeTab !== 'overview') {
        fetchTableData(activeTab);
      }
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    const envUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    
    if (username === envUser && password === envPass) {
      setIsAuthenticated(true);
      localStorage.setItem('auth', 'true');
      setLoginError('');
      setActiveTab('ai_histories');
      localStorage.setItem('activeTab', 'ai_histories');
    } else {
      setLoginError('Kredensial tidak valid');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth');
    setUsername('');
    setPassword('');
    setData([]);
    setActiveTab('overview');
    localStorage.setItem('activeTab', 'overview');
    setQueryError('');
  };

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('app_logs').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        setConnectionStatus('Connected (with errors)');
      } else {
        setConnectionStatus('Connected');
      }
    } catch (err) {
      setConnectionStatus('Disconnected');
    }
  };

  const fetchStats = async () => {
    try {
      const [{ count: logsCount }, { count: aiCount }] = await Promise.all([
        supabase.from('app_logs').select('*', { count: 'exact', head: true }),
        supabase.from('ai_histories').select('*', { count: 'exact', head: true })
      ]);
      setStats({ 
        logsCount: logsCount || 0, 
        aiCount: aiCount || 0 
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTableData = async (table) => {
    setLoading(true);
    setQueryError('');
    setData([]); // Clear old data to prevent crash during transition
    try {
      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setQueryError(err.message || 'Error fetching data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  const getLevelBadge = (level) => {
    if (!level) return <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>-</span>;
    const l = String(level).toLowerCase();
    if (l === 'error' || l === 'fatal') return <span className="badge badge-error" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{level}</span>;
    if (l === 'warning' || l === 'warn') return <span className="badge badge-warning" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>{level}</span>;
    if (l === 'info') return <span className="badge badge-info" style={{ backgroundColor: '#e0f2fe', color: '#075985' }}>{level}</span>;
    return <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>{level}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
                <Database size={32} />
              </div>
            </div>
            <h1>Smart Blind Monitor</h1>
            <p>Masuk menggunakan kredensial admin</p>
          </div>
          
          <form onSubmit={handleLogin}>
            {loginError && <div className="error-message">{loginError}</div>}
            
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Status API</h3>
              <div className="value">{connectionStatus}</div>
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('ai_histories')}>
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <h3>Total AI Histories</h3>
              <div className="value">{stats.aiCount}</div>
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('app_logs')}>
            <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3>Total App Logs</h3>
              <div className="value">{stats.logsCount}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {activeTab === 'ai_histories' ? 'AI Histories (Riwayat Interaksi AI)' : 'App Logs (Log Aplikasi)'}
          </h3>
          <button className="btn btn-primary" onClick={() => fetchTableData(activeTab)} style={{ padding: '0.5rem 1rem' }} disabled={loading}>
            {loading ? <RefreshCw size={18} className="spin-animation" /> : <RefreshCw size={18} />}
            <span style={{ marginLeft: '0.5rem' }}>Refresh</span>
          </button>
        </div>
        
        <div style={{ padding: '1rem' }}>
          {queryError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              {queryError}
            </div>
          )}

          {loading && data.length === 0 ? (
            <div className="loader"></div>
          ) : data.length > 0 ? (
            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="table">
                <thead>
                  {activeTab === 'ai_histories' ? (
                    <tr>
                      <th style={{ width: '15%' }}>Waktu</th>
                      <th style={{ width: '10%' }}>Model</th>
                      <th style={{ width: '10%' }}>Mode</th>
                      <th style={{ width: '30%' }}>Prompt</th>
                      <th style={{ width: '35%' }}>Response</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ width: '15%' }}>Waktu</th>
                      <th style={{ width: '10%' }}>Level</th>
                      <th style={{ width: '15%' }}>Tag</th>
                      <th style={{ width: '30%' }}>Message</th>
                      <th style={{ width: '30%' }}>Error Details</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      {activeTab === 'ai_histories' ? (
                        <>
                          <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                          <td><span className="badge" style={{ backgroundColor: '#f1f5f9' }}>{row.model}</span></td>
                          <td>{row.mode}</td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.prompt}>{row.prompt}</td>
                          <td style={{ maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.response}>{row.response}</td>
                        </>
                      ) : (
                        <>
                          <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(row.created_at)}</td>
                          <td>{getLevelBadge(row.level)}</td>
                          <td style={{ fontWeight: '500' }}>{row.tag}</td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.message}>{row.message}</td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ef4444' }} title={row.error_details}>{row.error_details || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !queryError && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                <Database size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                <p>Belum ada data untuk {activeTab === 'ai_histories' ? 'AI Histories' : 'App Logs'}.</p>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Database size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Smart Blind DB
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <a href="#" className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('overview'); localStorage.setItem('activeTab', 'overview'); }}>
            <LayoutDashboard size={20} />
            Overview
          </a>
          <a href="#" className={`nav-item ${activeTab === 'ai_histories' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ai_histories'); localStorage.setItem('activeTab', 'ai_histories'); }}>
            <MessageSquare size={20} />
            AI Histories
          </a>
          <a href="#" className={`nav-item ${activeTab === 'app_logs' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('app_logs'); localStorage.setItem('activeTab', 'app_logs'); }}>
            <AlertTriangle size={20} />
            App Logs
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', marginTop: 'auto' }}>
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>
            {activeTab === 'overview' ? 'Dashboard Overview' : 
             activeTab === 'ai_histories' ? 'AI Interaction History' : 'Application Logs'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`badge ${connectionStatus.includes('Connected') ? 'badge-success' : 'badge-warning'}`}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: connectionStatus.includes('Connected') ? '#22c55e' : '#eab308', marginRight: '0.5rem' }}></div>
              {connectionStatus.includes('Connected') ? 'Database Online' : 'Checking...'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <User size={18} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Admin</span>
            </div>
          </div>
        </header>
        
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
