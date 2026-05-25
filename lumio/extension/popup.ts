const LUMIO_API = 'http://localhost:3000/api/tasks';
const DEFAULT_PROJECT_ID = 'seed-project-001';

document.getElementById('submit-btn')!.addEventListener('click', async () => {
  const title = (document.getElementById('task-title') as HTMLInputElement).value.trim();
  const priority = (document.getElementById('task-priority') as HTMLSelectElement).value;
  const status = document.getElementById('status')!;

  if (!title) {
    status.textContent = 'Please enter a task title.';
    status.className = 'error';
    return;
  }

  status.textContent = 'Adding task…';
  status.className = '';

  try {
    const res = await fetch(LUMIO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, priority, projectId: DEFAULT_PROJECT_ID }),
    });

    if (!res.ok) throw new Error(await res.text());

    status.textContent = '✓ Task added to Lumio!';
    status.className = 'success';
    (document.getElementById('task-title') as HTMLInputElement).value = '';
  } catch (err) {
    status.textContent = 'Failed to add task. Make sure you are logged into Lumio.';
    status.className = 'error';
  }
});
