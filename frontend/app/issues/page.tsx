'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIssues, type IssueCategory, type IssueStatus, type IssuePriority } from '@/contexts/IssueContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPriorityColor, getStatusColor } from '@/lib/utils';
import { FiAlertCircle, FiX, FiPlus, FiFilter } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function IssuesPage() {
  const router = useRouter();
  const { issues, loading, error, fetchIssues, createIssue } = useIssues();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMyIssues, setShowMyIssues] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure' as IssueCategory,
    priority: 'medium' as IssuePriority,
    location: '',
  });

  useEffect(() => {
    const filters: any = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    if (selectedStatus !== 'all') filters.status = selectedStatus;
    if (showMyIssues) filters.myIssues = true;
    
    fetchIssues(filters);
  }, [selectedCategory, selectedStatus, showMyIssues]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createIssue(formData);
      setFormData({
        title: '',
        description: '',
        category: 'infrastructure',
        priority: 'medium',
        location: '',
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const categories: Array<IssueCategory | 'all'> = [
    'all',
    'infrastructure',
    'academics',
    'hostel',
    'mess',
    'internet',
    'security',
    'sports',
    'other',
  ];

  const statuses: Array<IssueStatus | 'all'> = ['all', 'open', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FiAlertCircle className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white">
                  Issue Reporting
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Report and track campus issues</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3 font-semibold flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Report Issue
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiFilter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-custom">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-button whitespace-nowrap transition duration-200 ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-glow-primary font-semibold'
                        : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Status</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-custom">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-button whitespace-nowrap transition duration-200 ${
                      selectedStatus === status
                        ? 'bg-primary text-white shadow-glow-primary font-semibold'
                        : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* My Issues Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="myIssues"
                checked={showMyIssues}
                onChange={(e) => setShowMyIssues(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
              />
              <label htmlFor="myIssues" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Show only my issues
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-card p-4 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Issues List */}
        {!loading && issues.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <FiAlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No issues found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your filters or report a new issue</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => router.push(`/issues/${issue.id}`)}
                className="card card-glow group p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors mb-2">{issue.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{issue.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        issue.priority
                      )}`}
                    >
                      {issue.priority.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 flex-wrap">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-dark-card rounded-lg">
                    {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                  </span>
                  {issue.location && (
                    <span>📍 {issue.location}</span>
                  )}
                  <span>👤 {issue.reporter_name}</span>
                  <span>🕒 {new Date(issue.created_at).toLocaleDateString()}</span>
                  {issue.assigned_to_name && (
                    <span>👷 Assigned to {issue.assigned_to_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Issue Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto scrollbar-custom animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">Report New Issue</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition"
                >
                  <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Detailed description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as IssueCategory })
                      }
                      className="input-field"
                    >
                      <option value="infrastructure">Infrastructure</option>
                      <option value="academics">Academics</option>
                      <option value="hostel">Hostel</option>
                      <option value="mess">Mess</option>
                      <option value="internet">Internet</option>
                      <option value="security">Security</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as IssuePriority })
                      }
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="Where is the issue located?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1 px-6 py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 px-6 py-3"
                  >
                    Report Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
