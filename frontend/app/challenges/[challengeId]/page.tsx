"use client";

import React, { useState } from "react";
import { useChallenges } from "@/contexts/ChallengesContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiActivity,
  FiBook,
  FiUsers,
  FiFeather,
  FiGlobe,
  FiHeart,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiAward,
  FiUser,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { ChallengeType } from "@/contexts/ChallengesContext";

const challengeTypeIcons: Record<ChallengeType, React.ComponentType<{ className?: string }>> = {
  fitness: FiActivity,
  academic: FiBook,
  social: FiUsers,
  creative: FiFeather,
  environmental: FiGlobe,
  wellness: FiHeart,
};

const difficultyColors = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;
  
  const { challenges, joinChallenge, leaveChallenge, completeChallenge, updateProgress, isParticipant } = useChallenges();
  const [localProgress, setLocalProgress] = useState(0);
  const [completionPassword, setCompletionPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Challenge Not Found</h1>
          <Link href="/challenges" className="text-accent-lime hover:text-accent-lime/80">
            ← Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = challengeTypeIcons[challenge.challenge_type];
  const isJoined = isParticipant(challenge.id, "current-user");
  const currentUserParticipation = challenge.participants.find((p) => p.user_id === "current-user");
  const isCompleted = currentUserParticipation?.completed || false;
  const currentProgress = currentUserParticipation?.progress || 0;

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isFull = challenge.max_participants ? challenge.participant_count >= challenge.max_participants : false;

  const handleJoin = () => {
    const success = joinChallenge(challenge.id);
    if (!success) {
      alert("Unable to join challenge. It may be full or you may already be a participant.");
    }
  };

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave this challenge?")) {
      leaveChallenge(challenge.id);
    }
  };

  const handleComplete = () => {
    const success = completeChallenge(challenge.id, completionPassword);
    if (success) {
      alert(`Congratulations! Challenge completed! You earned ${challenge.points} points! 🎉`);
      setShowPasswordInput(false);
      setCompletionPassword("");
    } else {
      alert("Incorrect password! Please get the completion password from the challenge organizer.");
    }
  };

  const handleProgressUpdate = () => {
    updateProgress(challenge.id, localProgress);
    alert(`Progress updated to ${localProgress}%`);
  };

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/challenges"
          className="text-accent-lime hover:text-accent-lime/80 mb-6 inline-flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Challenges
        </Link>

        {/* Challenge Header */}
        <div className="bg-dark-secondary rounded-lg p-8 border border-dark-secondary mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-lg bg-dark flex items-center justify-center">
                <TypeIcon className="w-8 h-8 text-accent-lime" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{challenge.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-sm px-4 py-2 rounded-full border capitalize font-semibold ${difficultyColors[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-sm px-4 py-2 rounded-full bg-dark text-gray-400 capitalize flex items-center gap-2">
                    <TypeIcon className="w-4 h-4" />
                    {challenge.challenge_type}
                  </span>
                  <span className="text-sm text-gray-500">Created by {challenge.creator_name}</span>
                </div>
              </div>
            </div>
            <div className="text-center bg-dark rounded-lg p-4 border border-accent-lime/20">
              <FiAward className="w-8 h-8 mx-auto mb-2 text-accent-lime" />
              <div className="text-3xl font-bold text-accent-lime">{challenge.points}</div>
              <div className="text-sm text-gray-400">Points</div>
            </div>
          </div>

          <p className="text-gray-300 text-lg mb-6">{challenge.description}</p>

          {/* Challenge Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <div className="font-semibold">{startDate.toLocaleDateString()}</div>
            </div>
            <div className="bg-dark rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">Days Left</span>
              </div>
              <div className="font-semibold">{daysLeft > 0 ? `${daysLeft} days` : "Ending today"}</div>
            </div>
            <div className="bg-dark rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FiUsers className="w-4 h-4" />
                <span className="text-sm">Participants</span>
              </div>
              <div className="font-semibold">
                {challenge.participant_count}
                {challenge.max_participants ? ` / ${challenge.max_participants}` : ""}
              </div>
            </div>
            <div className="bg-dark rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FiTrendingUp className="w-4 h-4" />
                <span className="text-sm">End Date</span>
              </div>
              <div className="font-semibold">{endDate.toLocaleDateString()}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isJoined ? (
              <button
                onClick={handleJoin}
                disabled={isFull}
                className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-dark font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFull ? "Challenge Full" : "Join Challenge"}
              </button>
            ) : isCompleted ? (
              <div className="flex-1 bg-dark border border-green-400 text-green-400 font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                <FiCheckCircle className="w-5 h-5" />
                Completed!
              </div>
            ) : (
              <>
                {showPasswordInput ? (
                  <div className="flex-1 flex gap-3">
                    <input
                      type="text"
                      value={completionPassword}
                      onChange={(e) => setCompletionPassword(e.target.value)}
                      placeholder="Enter completion password from organizer"
                      className="flex-1 bg-dark border border-dark-secondary rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime"
                    />
                    <button
                      onClick={handleComplete}
                      disabled={!completionPassword}
                      className="px-6 py-4 bg-accent-lime hover:bg-accent-lime/90 text-dark font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordInput(false);
                        setCompletionPassword("");
                      }}
                      className="px-6 py-4 bg-dark border border-dark-secondary hover:border-gray-400 text-gray-400 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowPasswordInput(true)}
                      className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-dark font-bold py-4 rounded-lg transition-all"
                    >
                      Mark as Complete
                    </button>
                    <button
                      onClick={handleLeave}
                      className="px-6 py-4 bg-dark border border-red-400/50 hover:border-red-400 text-red-400 rounded-lg font-semibold transition-all"
                    >
                      Leave
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Section (for joined users) */}
        {isJoined && !isCompleted && (
          <div className="bg-dark-secondary rounded-lg p-6 border border-dark-secondary mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6 text-accent-lime" />
              Your Progress
            </h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Current Progress</span>
                <span className="text-lg font-bold text-accent-lime">{currentProgress}%</span>
              </div>
              <div className="w-full h-4 bg-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-lime transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={localProgress}
                onChange={(e) => setLocalProgress(parseInt(e.target.value) || 0)}
                className="flex-1 bg-dark border border-dark-secondary rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-lime"
                placeholder="Enter progress (0-100)"
              />
              <button
                onClick={handleProgressUpdate}
                className="px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark font-semibold rounded-lg transition-all"
              >
                Update Progress
              </button>
            </div>
          </div>
        )}

        {/* Participants Section */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-secondary">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FiUsers className="w-6 h-6 text-accent-lime" />
            Participants ({challenge.participants.length})
          </h2>

          {challenge.participants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenge.participants
                .sort((a, b) => {
                  // Completed participants first, then by join date
                  if (a.completed && !b.completed) return -1;
                  if (!a.completed && b.completed) return 1;
                  return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
                })
                .map((participant, index) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-4 p-4 bg-dark rounded-lg border border-dark-secondary"
                  >
                    <div className="w-10 h-10 rounded-full bg-dark-secondary flex items-center justify-center font-bold text-gray-400">
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-dark-secondary flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{participant.user_name}</div>
                      <div className="text-sm text-gray-400">
                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      {participant.completed ? (
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <FiCheckCircle className="w-5 h-5" />
                          Completed
                        </div>
                      ) : (
                        <div className="text-gray-400 font-semibold">
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
