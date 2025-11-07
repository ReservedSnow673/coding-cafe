"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts";
import { FiMessageCircle, FiUsers, FiPlus, FiClock, FiX } from "react-icons/fi";

export default function ChatPage() {
  const router = useRouter();
  const { groups, loading, error, fetchGroups, createGroup } = useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setCreating(true);
    const newGroup = await createGroup(groupName, groupDescription, []);
    setCreating(false);

    if (newGroup) {
      setGroupName("");
      setGroupDescription("");
      setShowCreateModal(false);
      // Navigate to the new group
      router.push(`/chat/${newGroup.id}`);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl">
              <FiMessageCircle className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Group Chats
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {groups.length} {groups.length === 1 ? "group" : "groups"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/50"
          >
            <FiPlus className="text-lg" />
            New Group
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && groups.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-gray-900/50 rounded-full mb-6">
              <FiMessageCircle className="text-6xl text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No groups yet</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Create your first group chat to start collaborating with your classmates
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all"
            >
              <FiPlus className="text-lg" />
              Create Group
            </button>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/chat/${group.id}`)}
                className="group cursor-pointer bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member Count */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FiUsers className="text-base" />
                  <span>{group.member_count} members</span>
                </div>

                {/* Last Message Preview */}
                {group.last_message && (
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {group.last_message}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                {group.last_message_at && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FiClock className="text-sm" />
                    <span>{formatTimestamp(group.last_message_at)}</span>
                  </div>
                )}

                {group.last_message === null && (
                  <p className="text-sm text-gray-600 italic">No messages yet</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Create Group</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., CSE Year 2"
                    required
                    maxLength={255}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    maxLength={1000}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !groupName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Group"}
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
