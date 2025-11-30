'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useIssues, type Issue, type IssueStatus } from '@/contexts/IssueContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPriorityColor, getStatusColor } from '@/lib/utils';
import { FiArrowLeft, FiClock, FiUser, FiMapPin, FiEdit } from 'react-icons/fi';

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getIssueById, updateIssueStatus } = useIssues();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('open');

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    setLoading(true);
    const issueData = await getIssueById(id);
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Issue not found</p>
          <button
            onClick={() => router.push('/issues')}
            className="btn-primary px-6 py-3"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white dark:bg-black animate-fade-in">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/issues')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary mb-6 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Issues</span>
        </button>

        {/* Issue Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-4">{issue.title}</h1>
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
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                </span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowStatusUpdate(true)}
                className="ml-4 p-3 btn-primary"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <FiUser className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500">Reported by</div>
                <div className="text-black dark:text-white">{issue.reporter_name}</div>
              </div>
            </div>

            {issue.location && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <FiMapPin className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Location</div>
                  <div className="text-black dark:text-white">{issue.location}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <FiClock className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500">Created</div>
                <div className="text-black dark:text-white">
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
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <FiUser className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Assigned to</div>
                  <div className="text-black dark:text-white">{issue.assigned_to_name}</div>
                </div>
              </div>
            )}

            {issue.resolved_at && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <FiClock className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Resolved</div>
                  <div className="text-black dark:text-white">
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
            <div className="text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="card max-w-md w-full p-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Update Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="input-field"
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
                    className="btn-secondary flex-1 px-6 py-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="btn-primary flex-1 px-6 py-3"
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
