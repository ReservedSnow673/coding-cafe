'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getTeamById, deleteTeam, requestToJoin, leaveTeam } = useTeams();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [params.id]);

  const loadTeam = async () => {
    setLoading(true);
    const teamData = await getTeamById(params.id);
    if (teamData) {
      setTeam(teamData);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await deleteTeam(params.id);
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await requestToJoin(params.id);
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
      await leaveTeam(params.id);
      router.push('/teams');
    } catch (error: any) {
      alert(error.message || 'Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Team not found</p>
          <button
            onClick={() => router.push('/teams')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/teams')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back
          </button>

          {isLeader && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                  <FiUsers className="text-4xl text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {team.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {team.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        isFull
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-green-500/10 text-green-400 border-green-500/30'
                      }`}
                    >
                      {team.current_members}/{team.max_members} Members
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                  <p className="text-gray-300 leading-relaxed">{team.description}</p>
                </div>

                {team.tags && team.tags.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {team.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-gray-400">
                    <FiUser className="text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Leader</div>
                      <div className="text-white">{team.leader_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <FiClock className="text-xl" />
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="text-white">
                        {new Date(team.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            {team.members && team.members.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Members</h2>
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{member.full_name}</div>
                          <div className="text-sm text-gray-400">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.role === 'leader' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            Leader
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                {!isMember && !isFull && !isLeader && (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    <FiUserPlus className="text-lg" />
                    Request to Join
                  </button>
                )}

                {isMember && !isLeader && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    <FiLogOut className="text-lg" />
                    Leave Team
                  </button>
                )}

                {isFull && !isMember && !isLeader && (
                  <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <p className="text-orange-400 text-sm">This team is currently full</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Team Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Members</span>
                  <span className="text-white font-semibold">{team.current_members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Available Spots</span>
                  <span className="text-white font-semibold">
                    {team.max_members - team.current_members}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Visibility</span>
                  <span className="text-white font-semibold">
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
