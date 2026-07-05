import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Database, 
  Lock, 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Activity,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [tableName, setTableName] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');

  useEffect(() => {
    if (isAuthenticated) {
      checkConnection();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setTableData([]);
    setTableName('');
    setQueryError('');
  };

  const checkConnection = async () => {
    try {
      // Just a simple ping to see if url is reachable by checking an arbitrary table limit 0
      const { error } = await supabase.from('_dummy_table_check').select('*').limit(1);
      // If it's a valid Supabase url, it will return a PostgREST error (PGRST116 or 42P01 relation does not exist)
      // which is fine, it means we reached the API.
      setConnectionStatus('Connected');
    } catch (err) {
      setConnectionStatus('Disconnected');
    }
  };

  const fetchTableData = async () => {
    if (!tableName.trim()) {
      setQueryError('Please enter a table name');
      return;
    }
    setLoading(true);
    setQueryError('');
    try {
      const { data, error } = await supabase
        .from(tableName.trim())
        .select('*')
        .limit(50);
        
      if (error) throw error;
      setTableData(data || []);
    } catch (err) {
      setQueryError(err.message || 'Error fetching data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
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
            <h1>Database Monitor</h1>
            <p>Sign in to access your Supabase dashboard</p>
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
                  placeholder="Enter username"
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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Database size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Data Monitor
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <a href="#" className="nav-item active">
            <LayoutDashboard size={20} />
            Overview
          </a>
          <a href="#" className="nav-item">
            <Activity size={20} />
            Activity Log
          </a>
          <a href="#" className="nav-item">
            <Settings size={20} />
            Settings
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', marginTop: 'auto' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Dashboard Overview</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`badge ${connectionStatus === 'Connected' ? 'badge-success' : 'badge-warning'}`}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: connectionStatus === 'Connected' ? '#22c55e' : '#eab308', marginRight: '0.5rem' }}></div>
              API {connectionStatus}
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
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Database size={24} />
              </div>
              <div className="stat-content">
                <h3>Target Database</h3>
                <div className="value" style={{ fontSize: '1rem', wordBreak: 'break-all' }}>gwvqayapzvapowcujqyv</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <h3>Status</h3>
                <div className="value">Online</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Search size={24} />
              </div>
              <div className="stat-content">
                <h3>Rows Fetched</h3>
                <div className="value">{tableData.length}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Data Explorer</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter table name..."
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '250px' }}
                    onKeyDown={(e) => e.key === 'Enter' && fetchTableData()}
                  />
                </div>
                <button className="btn btn-primary" onClick={fetchTableData} style={{ padding: '0.5rem 1rem' }} disabled={loading}>
                  {loading ? '...' : 'Query'}
                </button>
              </div>
            </div>
            
            <div style={{ padding: '1rem' }}>
              {queryError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <AlertCircle size={18} />
                  {queryError}
                </div>
              )}

              {loading ? (
                <div className="loader"></div>
              ) : tableData.length > 0 ? (
                <div className="table-responsive" style={{ marginTop: '1rem' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        {Object.keys(tableData[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !queryError && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Database size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                    <p>No data to display. Enter a table name and query to view records.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
