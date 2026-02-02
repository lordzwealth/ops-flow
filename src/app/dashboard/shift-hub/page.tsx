// src/app/(dashboard)/shift-hub/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ShiftHubPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [commentary, setCommentary] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [newEvidence, setNewEvidence] = useState('');
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Get user profile to get department
      const { data: profile } = await supabase
        .from('users')
        .select('department')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Fetch tasks for today
      const today = new Date().toISOString().split('T')[0];
      const { data: taskData, error } = await supabase
        .from('task_instances')
        .select('*')
        .eq('department', profile.department)
        .gte('scheduled_time', `${today}T00:00:00Z`)
        .lt('scheduled_time', `${today}T23:59:59Z`)
        .order('scheduled_time', { ascending: true });

      if (!error && taskData) {
        setTasks(taskData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockTask = async () => {
    if (!selectedTask || !commentary.trim()) {
      alert('Please enter commentary before locking');
      return;
    }

    if (new Date().getHours() >= 17) {
      alert('Shift ended at 17:00. No new locks allowed.');
      return;
    }

    try {
      setLocking(true);
      const { data: { user } } = await supabase.auth.getUser();

      const scheduledTime = new Date(selectedTask.scheduled_time);
      const lockedTime = new Date();
      const tatMinutes = Math.round(
        (lockedTime.getTime() - scheduledTime.getTime()) / 60000
      );

      // Get routine to check TAT SLA
      const { data: routine } = await supabase
        .from('routines')
        .select('tat_minutes')
        .eq('id', selectedTask.routine_id)
        .single();

      const tatBreached = routine && tatMinutes > routine.tat_minutes;

      // Update task
      const { error } = await supabase
        .from('task_instances')
        .update({
          status: 'Locked',
          commentary,
          evidence: JSON.stringify(evidence),
          assigned_operator: user?.id,
          locked_time: lockedTime.toISOString(),
          tat_actual_minutes: tatMinutes,
          tat_breached: tatBreached,
        })
        .eq('id', selectedTask.id);

      if (!error) {
        // Log to audit ledger
        await supabase.from('audit_ledger').insert([
          {
            task_id: selectedTask.id,
            action: 'Locked',
            actor_id: user?.id,
            actor_role: (await supabase.from('users').select('role').eq('id', user?.id).single()).data?.role,
            details: {
              tat_actual_minutes: tatMinutes,
              tat_breached: tatBreached,
            },
          },
        ]);

        alert(`✅ Task locked. TAT: ${tatMinutes}min ${tatBreached ? '(BREACH!)' : '(OK)'}`);
        setSelectedTask(null);
        setCommentary('');
        setEvidence([]);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error locking task:', error);
      alert('Failed to lock task');
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Shift Hub</h1>
        <p className="text-gray-400">Execute and lock operational routines</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-slate-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">No tasks scheduled for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Task List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Tasks</h2>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition ${
                  task.status === 'Locked'
                    ? 'bg-green-900 border-green-500'
                    : task.tat_breached
                    ? 'bg-red-900 border-red-500'
                    : 'bg-slate-800 border-cyan-500 hover:bg-slate-700'
                } ${selectedTask?.id === task.id ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-cyan-300">{task.id}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(task.scheduled_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'Locked' && <CheckCircle size={20} className="text-green-400" />}
                    {task.tat_breached && <AlertCircle size={20} className="text-red-400" />}
                  </div>
                </div>

                {task.status === 'Locked' && (
                  <div className="text-xs text-gray-300 mt-2 p-2 bg-slate-900 rounded">
                    <p className="font-bold">🔒 LOCKED & IMMUTABLE</p>
                    <p className="mt-1">{task.commentary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Task Detail */}
          {selectedTask ? (
            <div className="bg-slate-800 border border-cyan-500 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Lock Task</h2>

              {selectedTask.status === 'Locked' ? (
                <div className="bg-green-900 border border-green-600 p-4 rounded">
                  <p className="text-green-300 font-bold mb-2">🔒 This task is locked</p>
                  <p className="text-sm text-gray-300">{selectedTask.commentary}</p>
                  {selectedTask.evidence && JSON.parse(selectedTask.evidence).length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Evidence:</p>
                      {JSON.parse(selectedTask.evidence).map((link: string, i: number) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 text-sm underline block"
                        >
                          📎 {link.slice(0, 50)}...
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Shift Commentary *</label>
                    <textarea
                      value={commentary}
                      onChange={(e) => setCommentary(e.target.value)}
                      placeholder="What happened during this task? Be precise."
                      className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Evidence Links</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={newEvidence}
                        onChange={(e) => setNewEvidence(e.target.value)}
                        placeholder="Paste Google Drive or Cloud Storage link..."
                        className="flex-1 bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newEvidence) {
                            setEvidence([...evidence, newEvidence]);
                            setNewEvidence('');
                          }
                        }}
                        className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
                      >
                        Add
                      </button>
                    </div>

                    {evidence.length > 0 && (
                      <div className="space-y-1">
                        {evidence.map((link, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-700 p-2 rounded text-xs">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline truncate">
                              📎 {link.slice(0, 40)}...
                            </a>
                            <button
                              onClick={() => setEvidence(evidence.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLockTask}
                    disabled={locking || !commentary.trim()}
                    className="w-full py-2 rounded font-bold bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white transition flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    {locking ? 'Locking...' : 'Lock & Commit'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center h-full min-h-96">
              <p className="text-gray-400">Select a task to lock</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
