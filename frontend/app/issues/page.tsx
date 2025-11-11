'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIssues, type IssueCategory, type IssueStatus, type IssuePriority } from '@/contexts/IssueContext';
import { useAuth } from '@/contexts/AuthContext';
import { FiAlertCircle, FiX, FiPlus, FiFilter } from 'react-icons/fi';

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

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Issue Reporting
              </h1>
              <p className="text-gray-400 mt-2">Report and track campus issues</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition flex items-center gap-2"
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
                <FiFilter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Category</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <span className="text-sm text-gray-400 mb-2 block">Status</span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
                className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="myIssues" className="text-sm text-gray-400 cursor-pointer">
                Show only my issues
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Issues List */}
        {!loading && issues.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No issues found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or report a new issue</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => router.push(`/issues/${issue.id}`)}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{issue.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{issue.description}</p>
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

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-white/5 rounded-lg">
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Report New Issue</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Detailed description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as IssueCategory })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as IssuePriority })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Where is the issue located?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition"
                  >
                    Report Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
