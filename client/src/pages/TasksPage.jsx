import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

export default function TasksPage() {
  return (
    <div>
      <h1>Task Management</h1>
      <TaskForm onTaskAdded={() => window.location.reload()} />
      <TaskList />
    </div>
  );
}