import TaskList from '../components/tasks/taskList';
import TaskForm from '../components/tasks/taskForm';

export default function TasksPage() {
  return (
    <div>
      <div
        style={{
          marginBottom: '40px',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '20px',
          }}
        >
          What needs to be done today?
        </h2>

        <TaskForm onTaskAdded={() => window.location.reload()} />
      </div>

      
      
      


      <TaskList />
    </div>
  );
}