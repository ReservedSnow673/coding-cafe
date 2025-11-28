'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIssues, type Issue, type IssueStatus } from '@/contexts/IssueContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPriorityColor, getStatusColor } from '@/lib/utils';
import { FiArrowLeft, FiClock, FiUser, FiMapPin, FiEdit } from 'react-icons/fi';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getIssueById, updateIssueStatus } = useIssues();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('open');

  useEffect(() => {
    loadIssue();
  }, [params.id]);

  const loadIssue = async () => {
    setLoading(true);
    const issueData = await getIssueById(params.id);
    if (issueData) {
      setIssue(issueData);
      setNewStatus(issueData.status);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!issue) return;

    try {
      await updateIssueStatus(issue.id, newStatus);
      await loadIssue();
      setShowStatusUpdate(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Issue not found</p>
          <button
            onClick={() => router.push('/issues')}
            className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/issues')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Issues</span>
        </button>

        {/* Issue Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{issue.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(
                    issue.priority
                  )}`}
                >
                  {issue.priority.toUpperCase()} PRIORITY
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    issue.status
                  )}`}
                >
                  {issue.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-gray-400 border border-white/10">
                  {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                </span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowStatusUpdate(true)}
                className="ml-4 p-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-400">
              <FiUser className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500">Reported by</div>
                <div className="text-white">{issue.reporter_name}</div>
              </div>
            </div>

            {issue.location && (
              <div className="flex items-center gap-3 text-gray-400">
                <FiMapPin className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-white">{issue.location}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-400">
              <FiClock className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-white">
                  {new Date(issue.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {issue.assigned_to_name && (
              <div className="flex items-center gap-3 text-gray-400">
                <FiUser className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500">Assigned to</div>
                  <div className="text-white">{issue.assigned_to_name}</div>
                </div>
              </div>
            )}

            {issue.resolved_at && (
              <div className="flex items-center gap-3 text-gray-400">
                <FiClock className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500">Resolved</div>
                  <div className="text-white">
                    {new Date(issue.resolved_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {issue.updated_at !== issue.created_at && (
            <div className="text-sm text-gray-500 pt-4 border-t border-white/10">
              Last updated: {new Date(issue.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusUpdate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Update Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
