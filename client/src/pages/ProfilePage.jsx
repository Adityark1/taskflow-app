import { useState } from 'react';

export default function ProfilePage() {
  // core credentials that will map to your login system later
  const [username, setUsername] = useState('Developer Core');
  const [email, setEmail] = useState('admin@taskflow.io');
  
  // Password state handling
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state preferences
  const [notifications, setNotifications] = useState(true);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert(`Changes saved: Username set to "${username}" and email to "${email}".`);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    
    alert('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    alert('Logging out of your session...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      alert('Account deleted.');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh', paddingBottom: '120px' }}>
      
      {/* BACKGROUND GLOW ACCENTS */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '550px', height: '550px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.06)', filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '450px', height: '450px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.04)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '2.6rem',
              fontWeight: '800',
              marginBottom: '10px',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Account Settings
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Manage your profile and security credentials
          </p>
        </div>

        {/* MAIN PROFILE CONTAINER GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', width: '100%', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR: CARD SUMMARY & LOGOUT */}
          <div 
            style={{ 
              background: 'rgba(30, 41, 59, 0.25)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '40px 24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: '#ffffff',
                fontWeight: '700',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
                marginBottom: '24px'
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>

            <h3 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '700', marginBottom: '6px' }}>{username || 'User Profile'}</h3>
            <span style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 12px', borderRadius: '999px' }}>
              Standard Workspace
            </span>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '24px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', textAlign: 'left', marginBottom: '24px' }}>
              <div>
                <p style={metaTitleStyle}>Email Address</p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', wordBreak: 'break-all' }}>{email || 'no-email@taskflow.io'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#ef4444',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              Log Out
            </button>
          </div>

          {/* RIGHT SIDEBAR: ACCOUNT DECK FORMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* MODULE 1: EDIT PROFILE */}
            <div style={cardWrapperStyle}>
              <div>
                <h4 style={cardHeadingStyle}>Profile Information</h4>
                <p style={cardSubheadingStyle}>Update your name and communication email parameters</p>
              </div>
              
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={inputLabelStyle}>Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={inputLabelStyle}>Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={primaryButtonStyle}>Save Profile</button>
                </div>
              </form>
            </div>

            {/* MODULE 2: PASSWORD CONFIG */}
            <div style={cardWrapperStyle}>
              <div>
                <h4 style={cardHeadingStyle}>Change Password</h4>
                <p style={cardSubheadingStyle}>Ensure your account stays secure by updating your secret passphrase</p>
              </div>

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={inputLabelStyle}>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={inputLabelStyle}>New Password</label>
                      <input 
                        type="password" 
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={inputLabelStyle}>Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={primaryButtonStyle}>Update Password</button>
                </div>
              </form>
            </div>

            {/* MODULE 3: PREFERENCES */}
            <div style={cardWrapperStyle}>
              <div>
                <h4 style={cardHeadingStyle}>Workspace Preferences</h4>
                <p style={cardSubheadingStyle}>Configure structural settings for your personal workspace layout</p>
              </div>

              <div style={settingRowStyle}>
                <div>
                  <p style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '600' }}>Real-time sync alerts</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Receive UI push animations on automated app changes</p>
                </div>
                <button onClick={() => setNotifications(!notifications)} style={toggleButtonStyle(notifications)}>
                  <div style={toggleCircleStyle(notifications)} />
                </button>
              </div>
            </div>

            {/* MODULE 4: REAL DANGER ZONE */}
            <div style={{ ...cardWrapperStyle, borderColor: 'rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}>
              <div style={settingRowStyle}>
                <div>
                  <h4 style={{ ...cardHeadingStyle, color: '#ef4444' }}>Delete Account</h4>
                  <p style={cardSubheadingStyle}>Permanently remove all your tasks and account metrics from the database</p>
                </div>
                <button onClick={handleDeleteAccount} style={dangerButtonStyle}>
                  Delete
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// INLINE STRUCTURAL HOOKS
const cardWrapperStyle = {
  background: 'rgba(30, 41, 59, 0.25)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '24px',
  padding: '28px 32px',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
};

const cardHeadingStyle = { color: '#ffffff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' };
const cardSubheadingStyle = { color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' };

const inputLabelStyle = {
  display: 'block',
  color: '#94a3b8',
  fontSize: '0.8rem',
  fontWeight: '600',
  marginBottom: '8px',
  letterSpacing: '0.02em'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
};

const primaryButtonStyle = {
  padding: '10px 22px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(168, 85, 247, 0.25)',
  transition: 'all 0.2s ease'
};

const dangerButtonStyle = {
  padding: '10px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const metaTitleStyle = { 
  color: '#475569', 
  marginBottom: '4px', 
  fontSize: '0.68rem', 
  fontWeight: '800', 
  textTransform: 'uppercase', 
  letterSpacing: '0.08em' 
};

const settingRowStyle = { display: 'flex', justifycontent: 'space-between', alignItems: 'center', width: '100%' };

const toggleButtonStyle = (isActive) => ({
  width: '50px',
  height: '26px',
  borderRadius: '999px',
  background: isActive ? 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)' : 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255,255,255,0.05)',
  cursor: 'pointer',
  position: 'relative',
  padding: '0',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow: isActive ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none'
});

const toggleCircleStyle = (isActive) => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#ffffff',
  position: 'absolute',
  top: '2px',
  left: isActive ? '26px' : '3px',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
});