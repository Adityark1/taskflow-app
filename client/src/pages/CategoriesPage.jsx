import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    const colors = [
      '#3b82f6', // blue
      '#22c55e', // green
      '#f97316', // orange
      '#ec4899', // pink
      '#eab308', // yellow
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#ef4444', // red
      '#10b981', // emerald
      '#f43f5e', // rose
      '#6366f1', // indigo
      '#14b8a6', // teal
      '#f59e0b', // amber
      '#84cc16', // lime
      '#a855f7', // violet
      '#0ea5e9', // sky
    ];

    const usedColors = new Set(categories.map(c => c.color));

    let availableColors = colors.filter(c => !usedColors.has(c));

    if (availableColors.length === 0) {
      availableColors = colors;
    }

    const selectedColor =
      availableColors[
        Math.floor(Math.random() * availableColors.length)
      ];

    try {
      await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory,
          color: selectedColor,
        }),
      });

      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <p
        style={{
          color: '#94a3b8',
          fontSize: '1rem',
          marginBottom: '20px',
        }}
      >
        Organize your categories
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Create category..."
          style={{
            flex: 1,
            padding: '18px 24px',
            borderRadius: '20px',
            border: '1px solid #334155',
            background: '#111827',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
          }}
        />

        <button
          onClick={handleAddCategory}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
        }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() =>
              navigate(`/categories/${category.id}`)
            }
            style={{
              background: category.color || '#1e293b',

              width: '280px',
              height: '180px',

              borderRadius: '24px',

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',

              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '600',

              cursor: 'pointer',

              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',

              transition: '0.2s ease',
            }}
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  );
}