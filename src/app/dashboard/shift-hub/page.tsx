// src/app/dashboard/shift-hub/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, AlertCircle, CheckCircle, Loader2, Zap, Plus } from 'lucide-react';

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

      const { data: profile } = await supabase
        .from('users')
        .select('department_id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: taskData } = await supabase
        .from('task_instances')
        .select('*')
        .eq('department_id', profile.department_id)
        .gte('scheduled_time', `${today}T00:00:00Z`)
        .lt('scheduled_time', `${today}T23:59:59Z`)
        .order('scheduled_time', { ascending: true });

      if (taskData) {
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

      const { data: routine } = await supabase
        .from('routines')
        .select('tat_minutes')
        .eq('id', selectedTask.routine_id)
        .single();

      const tatBreached = routine && tatMinutes > routine.tat_minutes;

      await supabase
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

      await supabase.from('audit_ledger').insert([
        {
          task_id: selectedTask.id,
          action: 'Locked',
          actor_id: user?.id,
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
    } catch (error) {
      console.error('Error locking task:', error);
      alert('Failed to lock task');
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="section-title">Shift Hub</h1>
        </div>
        <p className="section-subtitle">Execute and lock operational routines</p>
      </div>

      {tasks.length === 0 ? (
        <div className="card-lg text-center py-12">
          <p className="text-slate-600">No tasks scheduled for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-md-title">Today's Tasks</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left card-md card-hover transition-all ${
                    selectedTask?.id === task.id
                      ? 'border-blue-400 shadow-md bg-blue-50'
                      : ''
                  } ${
                    task.status === 'Locked'
                      ? 'border-emerald-200 bg-emerald-50'
                      : task.tat_breached
                      ? 'border-red-200 bg-red-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{task.id}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(task.scheduled_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'Locked' && (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      )}
                      {task.tat_breached && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {task.status === 'Locked' && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="badge-success text-xs">LOCKED</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Task Detail Form */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <div className="card-lg">
                <h2 className="text-lg-title mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Lock Task
                </h2>

                {selectedTask.status === 'Locked' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <p className="text-emerald-700 font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      This task is locked and immutable
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Commentary</p>
                        <p className="text-slate-700">{selectedTask.commentary}</p>
                      </div>
                      {selectedTask.evidence && JSON.parse(selectedTask.evidence).length > 0 && (
                        <div>
                          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Evidence</p>
                          <div className="space-y-2">
                            {JSON.parse(selectedTask.evidence).map((link: string, i: number) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm truncate"
                              >
                                📎 {link.slice(0, 50)}...
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Commentary */}
                    <div>
                      <label className="input-label">Commentary *</label>
                      <textarea
                        value={commentary}
                        onChange={(e) => setCommentary(e.target.value)}
                        placeholder="Describe what happened during this task..."
                        className="input resize-none h-32"
                      />
                      <p className="input-helper">This will be locked forever once submitted</p>
                    </div>

                    {/* Evidence */}
                    <div>
                      <label className="input-label">Evidence Links</label>
                      <div className="flex gap-3 mb-3">
                        <input
                          type="url"
                          value={newEvidence}
                          onChange={(e) => setNewEvidence(e.target.value)}
                          placeholder="Paste Google Drive or Cloud Storage link..."
                          className="input flex-1"
                        />
                        <button
                          onClick={() => {
                            if (newEvidence) {
                              setEvidence([...evidence, newEvidence]);
                              setNewEvidence('');
                            }
                          }}
                          className="btn-secondary btn-sm flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {evidence.length > 0 && (
                        <div className="space-y-2">
                          {evidence.map((link, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-blue-50 p-3 rounded-lg text-sm border border-blue-100"
                            >
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 truncate flex-1"
                              >
                                📎 {link.slice(0, 40)}...
                              </a>
                              <button
                                onClick={() => setEvidence(evidence.filter((_, idx) => idx !== i))}
                                className="text-red-600 hover:text-red-700 ml-2 text-lg"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleLockTask}
                      disabled={locking || !commentary.trim()}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                    >
                      {locking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Locking...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Lock & Commit
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-lg flex items-center justify-center min-h-96">
                <p className="text-slate-600 text-center">Select a task to lock</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
