import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CategoryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const foundCategory = data.find(
          (cat) => cat.id === Number(id)
        );

        setCategory(foundCategory);
      })
      .catch(console.error);

    fetch(`http://localhost:4000/api/tasks/category/${id}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(console.error);
  }, [id]);

  const handleDeleteCategory = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await fetch(
        `http://localhost:4000/api/categories/${category.id}`,
        {
          method: 'DELETE',
        }
      );

      navigate('/categories');
    } catch (error) {
      console.error(error);
    }
  };

  if (!category) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/categories')}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '20px',
        }}
      >
        ← Categories
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h2>{category.name}</h2>

        {category.is_default === 0 && (
          <button
            onClick={handleDeleteCategory}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Delete Category
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <p
          style={{
            color: '#94a3b8',
          }}
        >
          No tasks in this category yet.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, 280px)',
            gap: '24px',
          }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: `${category.color}22`,
                border: `1px solid ${category.color}`,

                width: '280px',
                height: '180px',

                padding: '20px',
                borderRadius: '24px',

                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3>{task.title}</h3>

                <p
                  style={{
                    marginTop: '10px',
                    color: '#94a3b8',
                  }}
                >
                  Status: {task.status}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <button
                  style={{
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Complete
                </button>

                <button
                  style={{
                    background: '#334155',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>

                <button
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}