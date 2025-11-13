'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams, type TeamCategory, type TeamStatus } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiFilter,
  FiX,
  FiTrendingUp,
  FiBookOpen,
  FiTarget,
  FiZap,
  FiAward,
} from 'react-icons/fi';

const CATEGORIES = [
  { value: 'project' as TeamCategory, label: 'Project', icon: FiTrendingUp },
  { value: 'competition' as TeamCategory, label: 'Competition', icon: FiAward },
  { value: 'study' as TeamCategory, label: 'Study', icon: FiBookOpen },
  { value: 'sports' as TeamCategory, label: 'Sports', icon: FiTarget },
  { value: 'club' as TeamCategory, label: 'Club', icon: FiUsers },
  { value: 'hackathon' as TeamCategory, label: 'Hackathon', icon: FiZap },
  { value: 'other' as TeamCategory, label: 'Other', icon: FiFilter },
];

export default function TeamsPage() {
  const router = useRouter();
  const { teams, loading, error, fetchTeams, createTeam } = useTeams();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'project' as TeamCategory,
    max_members: 10,
    is_public: true,
    tags: '',
  });

  useEffect(() => {
    const filters: any = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    if (searchQuery.trim()) filters.search = searchQuery.trim();

    fetchTeams(filters);
  }, [selectedCategory, searchQuery]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setCreating(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await createTeam({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        max_members: formData.max_members,
        is_public: formData.is_public,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      setFormData({
        name: '',
        description: '',
        category: 'project',
        max_members: 10,
        is_public: true,
        tags: '',
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.icon || FiUsers;
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-dark-secondary flex items-center justify-center">
                <FiUsers className="text-2xl text-accent-lime" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Teams
                </h1>
                <p className="text-gray-400 mt-1">
                  {teams.length} {teams.length === 1 ? 'team' : 'teams'} available
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all"
            >
              <FiPlus className="text-lg" />
              Create Team
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams by name or description..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <FiFilter className="text-lg" />
                All Teams
              </button>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && teams.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-white/5 rounded-full mb-6">
              <FiUsers className="text-6xl text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No teams found</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or create a new team'
                : 'Be the first to create a team!'}
            </p>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const Icon = getCategoryIcon(team.category);
              const isFull = team.current_members >= team.max_members;

              return (
                <div
                  key={team.id}
                  onClick={() => router.push(`/teams/${team.id}`)}
                  className="group cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                      <Icon className="text-2xl text-blue-400" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isFull
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-green-500/10 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {team.current_members}/{team.max_members}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {team.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {team.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>

                  {/* Tags */}
                  {team.tags && team.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {team.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {team.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                          +{team.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiUsers className="text-base" />
                      <span>{team.leader_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Team</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your team's purpose and goals..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                        setFormData({ ...formData, category: e.target.value as TeamCategory })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Members *
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      required
                      value={formData.max_members}
                      onChange={(e) =>
                        setFormData({ ...formData, max_members: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Comma-separated tags (e.g., python, ai, research)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-300 cursor-pointer">
                    Make team publicly visible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.name.trim() || !formData.description.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Team'}
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
