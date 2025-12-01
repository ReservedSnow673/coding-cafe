"use client";

import React, { useState } from "react";
import { useChallenges, ChallengeType, DifficultyLevel } from "@/contexts/ChallengesContext";
import Link from "next/link";
import {
  FiActivity,
  FiBook,
  FiUsers,
  FiFeather,
  FiGlobe,
  FiHeart,
  FiPlus,
  FiTrendingUp,
  FiClock,
  FiAward,
  FiUser,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";

const challengeTypeIcons: Record<ChallengeType, React.ComponentType<{ className?: string }>> = {
  fitness: FiActivity,
  academic: FiBook,
  social: FiUsers,
  creative: FiFeather,
  environmental: FiGlobe,
  wellness: FiHeart,
};

const difficultyColors = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

const difficultyBorders = {
  easy: "border-green-400/20",
  medium: "border-yellow-400/20",
  hard: "border-red-400/20",
};

export default function ChallengesPage() {
  const { challenges, leaderboard, getActiveChallenges } = useChallenges();
  const [selectedType, setSelectedType] = useState<ChallengeType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");

  const activeChallenges = getActiveChallenges();

  const filteredChallenges = activeChallenges.filter((challenge) => {
    const typeMatch = selectedType === "all" || challenge.challenge_type === selectedType;
    const difficultyMatch = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const totalPoints = activeChallenges.reduce((sum, c) => sum + c.points, 0);
  const totalParticipants = activeChallenges.reduce((sum, c) => sum + c.participant_count, 0);

  const challengeTypes: { value: ChallengeType; label: string }[] = [
    { value: "fitness", label: "Fitness" },
    { value: "academic", label: "Academic" },
    { value: "social", label: "Social" },
    { value: "creative", label: "Creative" },
    { value: "environmental", label: "Environmental" },
    { value: "wellness", label: "Wellness" },
  ];

  const difficultyLevels: { value: DifficultyLevel; label: string }[] = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-black p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-black dark:text-white">Campus Challenges</h1>
              <p className="text-gray-600 dark:text-gray-400">Join challenges, earn points, and compete with peers</p>
            </div>
            <Link
              href="/challenges/new"
              className="btn-primary px-6 py-3 font-semibold flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Challenge
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="w-5 h-5 text-primary dark:text-secondary" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Challenges</div>
              </div>
              <div className="text-3xl font-bold text-primary dark:text-secondary">{activeChallenges.length}</div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiAward className="w-5 h-5 text-primary dark:text-secondary" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
              </div>
              <div className="text-3xl font-bold text-primary dark:text-secondary">{totalPoints.toLocaleString()}</div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiUsers className="w-5 h-5 text-primary dark:text-secondary" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
              </div>
              <div className="text-3xl font-bold text-primary dark:text-secondary">{totalParticipants}</div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="w-5 h-5 text-primary dark:text-secondary" />
                <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
              </div>
              <div className="text-3xl font-bold text-primary dark:text-secondary">{activeChallenges.filter(c => {
                const end = new Date(c.end_date);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return end <= weekFromNow;
              }).length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Challenge Type</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-4 py-2 rounded-button transition-all duration-200 ${
                      selectedType === "all"
                        ? "bg-primary text-white shadow-glow-primary font-semibold"
                        : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover"
                    }`}
                  >
                    All
                  </button>
                  {challengeTypes.map((type) => {
                    const Icon = challengeTypeIcons[type.value];
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`px-4 py-2 rounded-button transition-all duration-200 flex items-center gap-2 ${
                          selectedType === type.value
                            ? "bg-primary text-white shadow-glow-primary font-semibold"
                            : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Difficulty</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedDifficulty("all")}
                    className={`px-4 py-2 rounded-button transition-all duration-200 ${
                      selectedDifficulty === "all"
                        ? "bg-primary text-white shadow-glow-primary font-semibold"
                        : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover"
                    }`}
                  >
                    All
                  </button>
                  {difficultyLevels.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => setSelectedDifficulty(diff.value)}
                      className={`px-4 py-2 rounded-button transition-all duration-200 capitalize ${
                        selectedDifficulty === diff.value
                          ? "bg-primary text-white shadow-glow-primary font-semibold"
                          : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover"
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenges List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              {selectedType === "all" ? "All" : challengeTypes.find((t) => t.value === selectedType)?.label} Challenges
              <span className="text-gray-600 dark:text-gray-400 text-lg ml-2">({filteredChallenges.length})</span>
            </h2>

            {filteredChallenges.length === 0 ? (
              <div className="card p-12 text-center">
                <FiTrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">No challenges found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters or create a new challenge!</p>
                <Link
                  href="/challenges/new"
                  className="btn-primary inline-block px-6 py-3 font-semibold"
                >
                  Create Challenge
                </Link>
              </div>
            ) : (
              filteredChallenges.map((challenge) => {
                const TypeIcon = challengeTypeIcons[challenge.challenge_type];
                const endDate = new Date(challenge.end_date);
                const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className="card card-glow group block p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-black dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors">{challenge.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{challenge.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-card capitalize ${difficultyColors[challenge.difficulty]}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 capitalize flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {challenge.challenge_type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">by {challenge.creator_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary dark:text-secondary mb-1">{challenge.points}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">points</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{challenge.participant_count} {challenge.max_participants ? `/ ${challenge.max_participants}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : "Ending today"}</span>
                        </div>
                      </div>
                      <button className="text-primary dark:text-secondary hover:opacity-80 text-sm font-semibold">
                        View Details →
                      </button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <FiAward className="w-6 h-6 text-primary dark:text-secondary" />
                <h2 className="text-2xl font-bold text-black dark:text-white">Leaderboard</h2>
              </div>

              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < 3 ? "bg-primary/5 dark:bg-secondary/5 border border-primary/20 dark:border-secondary/20" : "bg-gray-50 dark:bg-dark-card"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-400 text-black"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 dark:bg-dark-hover text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-hover flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-black dark:text-white">{entry.user_name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{entry.challenges_completed} completed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary dark:text-secondary font-bold">{entry.total_points}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
