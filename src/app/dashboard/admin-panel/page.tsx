// src/app/dashboard/admin-panel/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Edit2, MoreVertical, Loader } from 'lucide-react';

export default function AdminPanelPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'routines' | 'departments'>('routines');
  const [routines, setRoutines] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [showCreateDept, setShowCreateDept] = useState(false);

  const [routineForm, setRoutineForm] = useState({
    id: '',
    name: '',
    department_id: '',
    frequency: 'Daily',
    repeat_interval_minutes: 60,
    start_time: '08:00',
    end_time: '17:00',
    tat_minutes: 45,
    description: '',
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    description: '',
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: routinesData } = await supabase
        .from('routines')
        .select('*')
        .order('id', { ascending: true });

      const { data: deptsData } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      setRoutines(routinesData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!routineForm.id || !routineForm.name || !routineForm.department_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('routines').insert([
        {
          ...routineForm,
          created_by: user?.id,
          is_active: true,
        },
      ]);

      if (!error) {
        alert('✅ Routine created');
        setRoutineForm({
          id: '',
          name: '',
          department_id: '',
          frequency: 'Daily',
          repeat_interval_minutes: 60,
          start_time: '08:00',
          end_time: '17:00',
          tat_minutes: 45,
          description: '',
        });
        setShowCreateRoutine(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      alert('Failed to create routine');
    }
  };

  const handleCreateDept = async () => {
    if (!deptForm.name) {
      alert('Department name is required');
      return;
    }

    try {
      const { error } = await supabase.from('departments').insert([deptForm]);

      if (!error) {
        alert('✅ Department created');
        setDeptForm({
          name: '',
          description: '',
          operating_hours_start: '08:00',
          operating_hours_end: '17:00',
        });
        setShowCreateDept(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      await supabase.from('routines').delete().eq('id', id);
      alert('✅ Routine deleted');
      fetchData();
    } catch (error) {
      alert('Failed to delete routine');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      await supabase.from('departments').delete().eq('id', id);
      alert('✅ Department deleted');
      fetchData();
    } catch (error) {
      alert('Failed to delete department');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
        <p className="text-slate-600 mt-1">Manage routines and departments</p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 inline-flex rounded-full">
        <button
          onClick={() => setActiveTab('routines')}
          className={`px-6 py-2 rounded-full font-600 transition-all ${
            activeTab === 'routines'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Routines
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-6 py-2 rounded-full font-600 transition-all ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Departments
        </button>
      </div>

      {/* Routines Tab */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowCreateRoutine(!showCreateRoutine)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Routine
          </button>

          {showCreateRoutine && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">New Routine</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Routine ID (OPS-*)</label>
                  <input
                    type="text"
                    value={routineForm.id}
                    onChange={(e) => setRoutineForm({ ...routineForm, id: e.target.value })}
                    placeholder="OPS-CASH-001"
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={routineForm.name}
                    onChange={(e) => setRoutineForm({ ...routineForm, name: e.target.value })}
                    placeholder="Cash reconciliation"
                    className="input-glass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Department</label>
                  <select
                    value={routineForm.department_id}
                    onChange={(e) => setRoutineForm({ ...routineForm, department_id: e.target.value })}
                    className="input-glass"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Frequency</label>
                  <select
                    value={routineForm.frequency}
                    onChange={(e) => setRoutineForm({ ...routineForm, frequency: e.target.value })}
                    className="input-glass"
                  >
                    <option>Daily</option>
                    <option>Weekdays</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Interval (mins)</label>
                  <input
                    type="number"
                    value={routineForm.repeat_interval_minutes}
                    onChange={(e) => setRoutineForm({ ...routineForm, repeat_interval_minutes: parseInt(e.target.value) })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={routineForm.start_time}
                    onChange={(e) => setRoutineForm({ ...routineForm, start_time: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={routineForm.end_time}
                    onChange={(e) => setRoutineForm({ ...routineForm, end_time: e.target.value })}
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">TAT SLA (minutes)</label>
                <input
                  type="number"
                  value={routineForm.tat_minutes}
                  onChange={(e) => setRoutineForm({ ...routineForm, tat_minutes: parseInt(e.target.value) })}
                  className="input-glass"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleCreateRoutine} className="btn-primary flex-1">
                  Create
                </button>
                <button onClick={() => setShowCreateRoutine(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Routines List */}
          <div className="grid gap-4">
            {routines.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500">
                No routines created yet
              </div>
            ) : (
              routines.map((routine) => (
                <div key={routine.id} className="glass-card p-5 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{routine.id}</h4>
                    <p className="text-sm text-slate-600 mt-1">{routine.name}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="badge-glass">{routine.frequency}</span>
                      <span className="badge-glass">Every {routine.repeat_interval_minutes}m</span>
                      <span className="badge-glass">TAT: {routine.tat_minutes}m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-100/30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowCreateDept(!showCreateDept)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Department
          </button>

          {showCreateDept && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">New Department</h3>

              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Department Name</label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g., Disbursement"
                  className="input-glass"
                />
              </div>

              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Description</label>
                <textarea
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Department description"
                  className="input-glass resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={deptForm.operating_hours_start}
                    onChange={(e) => setDeptForm({ ...deptForm, operating_hours_start: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-600 text-slate-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={deptForm.operating_hours_end}
                    onChange={(e) => setDeptForm({ ...deptForm, operating_hours_end: e.target.value })}
                    className="input-glass"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleCreateDept} className="btn-primary flex-1">
                  Create
                </button>
                <button onClick={() => setShowCreateDept(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Departments List */}
          <div className="grid gap-4">
            {departments.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500">
                No departments created yet
              </div>
            ) : (
              departments.map((dept) => (
                <div key={dept.id} className="glass-card p-5 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{dept.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{dept.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="badge-glass">
                        {dept.operating_hours_start} - {dept.operating_hours_end}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDept(dept.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-100/30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
