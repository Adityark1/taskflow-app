import { useState, useEffect } from 'react';

export default function CategoriesDashboard({ onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), color: newCategoryColor })
      });

      if (res.ok) {
        setNewCategoryName('');
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* CREATE BLOCK */}
      <div style={panelCardStyle}>
        <h2 style={panelTitleStyle}>Create Category</h2>
        
        <form onSubmit={handleCreateCategory} style={formInlineLayoutStyle}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Category Name</label>
            <input 
              type="text" 
              placeholder="Name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '80px' }}>
            <label style={labelStyle}>Color</label>
            <input 
              type="color" 
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              style={nativeColorInputStyle}
            />
          </div>

          <button type="submit" style={createButtonStyle}>
            Add
          </button>
        </form>
      </div>

      {/* LIST BLOCK */}
      <div>
        <h3 style={sectionHeaderStyle}>Managed Categories ({categories.length})</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {categories.map((cat) => {
            const isProtectedDefault = ['general', 'work', 'personal', 'health'].includes(cat.name.toLowerCase());

            return (
              <div key={cat.id} style={{ ...categoryCardStyle, borderLeft: `4px solid ${cat.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                  <div>
                    <h4 style={categoryNameTextStyle}>{cat.name}</h4>
                    <span style={categoryHexCodeStyle}>{cat.color.toUpperCase()}</span>
                  </div>
                </div>

                {!isProtectedDefault ? (
                  <button onClick={() => handleDeleteCategory(cat.id)} style={deleteCategoryBtnStyle}>✕</button>
                ) : (
                  <span style={systemLockBadgeStyle}>Lock</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

const panelCardStyle = { padding: '24px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' };
const panelTitleStyle = { margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' };
const formInlineLayoutStyle = { display: 'flex', gap: '16px', alignItems: 'flex-end' };
const labelStyle = { fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.45)', color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const nativeColorInputStyle = { width: '100%', height: '38px', border: 'none', borderRadius: '8px', background: 'transparent', cursor: 'pointer', padding: 0 };
const createButtonStyle = { padding: '0 20px', height: '38px', borderRadius: '10px', border: 'none', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' };
const sectionHeaderStyle = { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', margin: '0' };
const categoryCardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.25)', border: '1px solid rgba(255,255,255,0.03)' };
const categoryNameTextStyle = { margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' };
const categoryHexCodeStyle = { fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', display: 'block', marginTop: '2px' };
const deleteCategoryBtnStyle = { background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' };
const systemLockBadgeStyle = { fontSize: '0.65rem', fontWeight: '600', color: '#475569' };