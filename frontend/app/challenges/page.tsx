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
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Campus Challenges</h1>
              <p className="text-gray-400">Join challenges, earn points, and compete with peers</p>
            </div>
            <Link
              href="/challenges/new"
              className="bg-accent-lime hover:bg-accent-lime/90 text-dark px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Challenge
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-secondary">
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="w-5 h-5 text-accent-lime" />
                <div className="text-sm text-gray-400">Active Challenges</div>
              </div>
              <div className="text-3xl font-bold text-accent-lime">{activeChallenges.length}</div>
            </div>
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-secondary">
              <div className="flex items-center gap-3 mb-2">
                <FiAward className="w-5 h-5 text-accent-lime" />
                <div className="text-sm text-gray-400">Total Points</div>
              </div>
              <div className="text-3xl font-bold text-accent-lime">{totalPoints.toLocaleString()}</div>
            </div>
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-secondary">
              <div className="flex items-center gap-3 mb-2">
                <FiUsers className="w-5 h-5 text-accent-lime" />
                <div className="text-sm text-gray-400">Participants</div>
              </div>
              <div className="text-3xl font-bold text-accent-lime">{totalParticipants}</div>
            </div>
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-secondary">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="w-5 h-5 text-accent-lime" />
                <div className="text-sm text-gray-400">This Week</div>
              </div>
              <div className="text-3xl font-bold text-accent-lime">{activeChallenges.filter(c => {
                const end = new Date(c.end_date);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return end <= weekFromNow;
              }).length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-dark-secondary rounded-lg p-4 border border-dark-secondary">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex-1">
                <label className="text-sm text-gray-400 mb-2 block">Challenge Type</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedType === "all"
                        ? "bg-accent-lime text-dark font-semibold"
                        : "bg-dark border border-dark-secondary hover:border-accent-lime"
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
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                          selectedType === type.value
                            ? "bg-accent-lime text-dark font-semibold"
                            : "bg-dark border border-dark-secondary hover:border-accent-lime"
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
                <label className="text-sm text-gray-400 mb-2 block">Difficulty</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedDifficulty("all")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedDifficulty === "all"
                        ? "bg-accent-lime text-dark font-semibold"
                        : "bg-dark border border-dark-secondary hover:border-accent-lime"
                    }`}
                  >
                    All
                  </button>
                  {difficultyLevels.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => setSelectedDifficulty(diff.value)}
                      className={`px-4 py-2 rounded-lg transition-all capitalize ${
                        selectedDifficulty === diff.value
                          ? "bg-accent-lime text-dark font-semibold"
                          : "bg-dark border border-dark-secondary hover:border-accent-lime"
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
            <h2 className="text-2xl font-bold mb-4">
              {selectedType === "all" ? "All" : challengeTypes.find((t) => t.value === selectedType)?.label} Challenges
              <span className="text-gray-400 text-lg ml-2">({filteredChallenges.length})</span>
            </h2>

            {filteredChallenges.length === 0 ? (
              <div className="bg-dark-secondary rounded-lg p-12 text-center border border-dark-secondary">
                <FiTrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your filters or create a new challenge!</p>
                <Link
                  href="/challenges/new"
                  className="inline-block bg-accent-lime hover:bg-accent-lime/90 text-dark px-6 py-3 rounded-lg font-semibold transition-all"
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
                    className={`block bg-dark-secondary rounded-lg p-6 border ${difficultyBorders[challenge.difficulty]} hover:border-accent-lime/50 transition-all`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-dark flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-accent-lime" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{challenge.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`text-xs px-3 py-1 rounded-full bg-dark capitalize ${difficultyColors[challenge.difficulty]}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-dark text-gray-400 capitalize flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {challenge.challenge_type}
                            </span>
                            <span className="text-xs text-gray-500">by {challenge.creator_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-lime mb-1">{challenge.points}</div>
                        <div className="text-xs text-gray-400">points</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dark-secondary">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{challenge.participant_count} {challenge.max_participants ? `/ ${challenge.max_participants}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : "Ending today"}</span>
                        </div>
                      </div>
                      <button className="text-accent-lime hover:text-accent-lime/80 text-sm font-semibold">
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
            <div className="bg-dark-secondary rounded-lg p-6 border border-dark-secondary sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <FiAward className="w-6 h-6 text-accent-lime" />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>

              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < 3 ? "bg-dark border border-accent-lime/20" : "bg-dark"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-dark"
                          : index === 1
                          ? "bg-gray-400 text-dark"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-dark-secondary text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{entry.user_name}</div>
                      <div className="text-xs text-gray-400">{entry.challenges_completed} completed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-accent-lime font-bold">{entry.total_points}</div>
                      <div className="text-xs text-gray-400">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
