'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTeams, type Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiArrowLeft,
  FiUsers,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiLogOut,
  FiClock,
  FiUser,
  FiMail,
} from 'react-icons/fi';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getTeamById, deleteTeam, requestToJoin, leaveTeam } = useTeams();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    setLoading(true);
    const teamData = await getTeamById(id);
    if (teamData) {
      setTeam(teamData);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await deleteTeam(id);
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await requestToJoin(id);
      alert('Join request sent successfully!');
      await loadTeam();
    } catch (error: any) {
      alert(error.message || 'Failed to send join request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    setActionLoading(true);
    try {
      await leaveTeam(id);
      router.push('/teams');
    } catch (error: any) {
      alert(error.message || 'Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Team not found</p>
          <button
            onClick={() => router.push('/teams')}
            className="btn-primary px-6 py-3"
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  const isLeader = user?.id === team.leader_id;
  const isMember = team.members?.some((member) => member.user_id === user?.id);
  const isFull = team.current_members >= team.max_members;

  return (
    <div className="min-h-screen bg-white dark:bg-black animate-fade-in">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/teams')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back
          </button>

          {isLeader && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-lg" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Info Card */}
            <div className="card p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 rounded-2xl">
                  <FiUsers className="text-4xl text-primary dark:text-secondary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{team.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary border border-primary/20 dark:border-secondary/20">
                      {team.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {team.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        isFull
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      }`}
                    >
                      {team.current_members}/{team.max_members} Members
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-black dark:text-white mb-2">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{team.description}</p>
                </div>

                {team.tags && team.tags.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {team.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-dark-card rounded-lg text-sm text-gray-700 dark:text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiUser className="text-xl" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">Leader</div>
                      <div className="text-black dark:text-white">{team.leader_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiClock className="text-xl" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">Created</div>
                      <div className="text-black dark:text-white">
                        {new Date(team.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            {team.members && team.members.length > 0 && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Members</h2>
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-black dark:text-white">{member.full_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.role === 'leader' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                            Leader
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Actions</h2>
              <div className="space-y-3">
                {!isMember && !isFull && !isLeader && (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-3 font-medium disabled:opacity-50"
                  >
                    <FiUserPlus className="text-lg" />
                    Request to Join
                  </button>
                )}

                {isMember && !isLeader && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    <FiLogOut className="text-lg" />
                    Leave Team
                  </button>
                )}

                {isFull && !isMember && !isLeader && (
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <p className="text-orange-600 dark:text-orange-400 text-sm">This team is currently full</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Team Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Members</span>
                  <span className="text-black dark:text-white font-semibold">{team.current_members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Available Spots</span>
                  <span className="text-black dark:text-white font-semibold">
                    {team.max_members - team.current_members}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Visibility</span>
                  <span className="text-black dark:text-white font-semibold">
                    {team.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
