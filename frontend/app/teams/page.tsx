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
import Navbar from '@/components/Navbar';

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
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FiUsers className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white">
                  Teams
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {teams.length} {teams.length === 1 ? 'team' : 'teams'} available
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 font-semibold"
            >
              <FiPlus className="text-lg" />
              Create Team
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams by name or description..."
                className="input-field pl-12"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-custom">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-button whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-glow-primary font-semibold'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover'
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-button whitespace-nowrap transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-primary text-white shadow-glow-primary font-semibold'
                        : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover'
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
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && teams.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-full mb-6">
              <FiUsers className="text-6xl text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No teams found</h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6 text-center max-w-md">
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
                  className="card card-glow group cursor-pointer p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 rounded-xl">
                      <Icon className="text-2xl text-primary dark:text-secondary" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          isFull
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        }`}
                      >
                        {team.current_members}/{team.max_members}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary border border-primary/20 dark:border-secondary/20">
                        {team.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors line-clamp-1">
                    {team.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>

                  {/* Tags */}
                  {team.tags && team.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {team.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-dark-card rounded-lg text-xs text-gray-600 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {team.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-card rounded-lg text-xs text-gray-600 dark:text-gray-400">
                          +{team.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiUsers className="text-base" />
                      <span>{team.leader_name}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto scrollbar-custom animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">Create New Team</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your team's purpose and goals..."
                    className="input-field resize-none"
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
                        setFormData({ ...formData, category: e.target.value as TeamCategory })
                      }
                      className="input-field"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Comma-separated tags (e.g., python, ai, research)"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:focus:ring-offset-dark-card"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Make team publicly visible
                  </label>
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
                    disabled={creating || !formData.name.trim() || !formData.description.trim()}
                    className="btn-primary flex-1 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Team'}
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
