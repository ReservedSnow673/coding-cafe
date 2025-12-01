"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ChallengeType = "fitness" | "academic" | "social" | "creative" | "environmental" | "wellness";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ChallengeParticipant {
  user_id: string;
  user_name: string;
  joined_at: string;
  completed: boolean;
  completed_at?: string;
  progress: number; // 0-100
}

export interface Challenge {
  id: string;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  difficulty: DifficultyLevel;
  points: number;
  start_date: string;
  end_date: string;
  max_participants?: number;
  completion_password: string;
  participant_count: number;
  participants: ChallengeParticipant[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  total_points: number;
  challenges_completed: number;
}

interface ChallengesContextType {
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  addChallenge: (challenge: Omit<Challenge, "id" | "creator_id" | "creator_name" | "participant_count" | "participants" | "is_active" | "created_at">) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  joinChallenge: (challengeId: string) => boolean;
  leaveChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string, password: string) => boolean;
  updateProgress: (challengeId: string, progress: number) => void;
  getChallengesByType: (type: ChallengeType) => Challenge[];
  getChallengesByDifficulty: (difficulty: DifficultyLevel) => Challenge[];
  getActiveChallenges: () => Challenge[];
  getUserChallenges: (userId: string) => Challenge[];
  isParticipant: (challengeId: string, userId: string) => boolean;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

// Mock data for development mode
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);

const mockChallenges: Challenge[] = [
  {
    id: "1",
    creator_id: "user1",
    creator_name: "Fitness Club",
    title: "Morning Run Streak",
    description: "Run at least 3km every morning for 7 days straight. Build consistency and start your day with energy!",
    challenge_type: "fitness",
    difficulty: "medium",
    points: 150,
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    max_participants: 50,
    completion_password: "RUN2024",
    participant_count: 12,
    participants: [
      { user_id: "user2", user_name: "Rahul Kumar", joined_at: today.toISOString(), completed: false, progress: 57 },
      { user_id: "user3", user_name: "Priya Singh", joined_at: today.toISOString(), completed: false, progress: 71 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "2",
    creator_id: "user2",
    creator_name: "Study Group",
    title: "Complete Data Structures Course",
    description: "Finish all modules of the Advanced Data Structures course and solve practice problems.",
    challenge_type: "academic",
    difficulty: "hard",
    points: 300,
    start_date: today.toISOString(),
    end_date: nextMonth.toISOString(),
    completion_password: "DATA2024",
    participant_count: 8,
    participants: [
      { user_id: "user1", user_name: "Arjun Patel", joined_at: today.toISOString(), completed: false, progress: 45 },
      { user_id: "user4", user_name: "Ananya Reddy", joined_at: today.toISOString(), completed: true, completed_at: new Date().toISOString(), progress: 100 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "3",
    creator_id: "user3",
    creator_name: "Social Committee",
    title: "Connect with 10 New People",
    description: "Have meaningful conversations with at least 10 students you haven't talked to before. Expand your network!",
    challenge_type: "social",
    difficulty: "easy",
    points: 100,
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    max_participants: 100,
    completion_password: "CONNECT10",
    participant_count: 24,
    participants: [
      { user_id: "user5", user_name: "Vikram Sharma", joined_at: today.toISOString(), completed: false, progress: 80 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "4",
    creator_id: "user4",
    creator_name: "Art Club",
    title: "30-Day Sketch Challenge",
    description: "Create one sketch every day for 30 days. Share your progress and improve your drawing skills!",
    challenge_type: "creative",
    difficulty: "medium",
    points: 200,
    start_date: today.toISOString(),
    end_date: nextMonth.toISOString(),
    completion_password: "SKETCH30",
    participant_count: 15,
    participants: [
      { user_id: "user2", user_name: "Rahul Kumar", joined_at: today.toISOString(), completed: false, progress: 23 },
      { user_id: "user3", user_name: "Priya Singh", joined_at: today.toISOString(), completed: false, progress: 30 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "5",
    creator_id: "user5",
    creator_name: "Green Campus Initiative",
    title: "Zero Waste Week",
    description: "Go completely zero waste for one week. Track your efforts and inspire others to reduce waste!",
    challenge_type: "environmental",
    difficulty: "hard",
    points: 250,
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    max_participants: 30,
    completion_password: "ZEROWASTE",
    participant_count: 18,
    participants: [
      { user_id: "user1", user_name: "Arjun Patel", joined_at: today.toISOString(), completed: false, progress: 60 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "6",
    creator_id: "user1",
    creator_name: "Wellness Center",
    title: "Meditation Masterclass",
    description: "Meditate for 15 minutes daily for 14 days. Track your mindfulness journey and find inner peace.",
    challenge_type: "wellness",
    difficulty: "easy",
    points: 120,
    start_date: today.toISOString(),
    end_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    completion_password: "MEDITATE14",
    participant_count: 32,
    participants: [
      { user_id: "user4", user_name: "Ananya Reddy", joined_at: today.toISOString(), completed: false, progress: 35 },
      { user_id: "user5", user_name: "Vikram Sharma", joined_at: today.toISOString(), completed: false, progress: 42 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "7",
    creator_id: "user2",
    creator_name: "Fitness Club",
    title: "Plank Challenge",
    description: "Increase your plank time every day. Start with 30 seconds and aim for 3 minutes by the end!",
    challenge_type: "fitness",
    difficulty: "easy",
    points: 80,
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    max_participants: 60,
    completion_password: "PLANK2024",
    participant_count: 28,
    participants: [
      { user_id: "user3", user_name: "Priya Singh", joined_at: today.toISOString(), completed: false, progress: 50 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "8",
    creator_id: "user3",
    creator_name: "Tech Society",
    title: "Build a Full-Stack App",
    description: "Design and develop a complete full-stack application from scratch. Showcase your skills!",
    challenge_type: "academic",
    difficulty: "hard",
    points: 400,
    start_date: today.toISOString(),
    end_date: nextMonth.toISOString(),
    completion_password: "FULLSTACK",
    participant_count: 6,
    participants: [
      { user_id: "user1", user_name: "Arjun Patel", joined_at: today.toISOString(), completed: false, progress: 65 },
      { user_id: "user2", user_name: "Rahul Kumar", joined_at: today.toISOString(), completed: false, progress: 40 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "9",
    creator_id: "user4",
    creator_name: "Events Team",
    title: "Attend 5 Campus Events",
    description: "Participate in at least 5 different campus events this month. Get involved in campus life!",
    challenge_type: "social",
    difficulty: "easy",
    points: 90,
    start_date: today.toISOString(),
    end_date: nextMonth.toISOString(),
    completion_password: "EVENTS5",
    participant_count: 45,
    participants: [
      { user_id: "user5", user_name: "Vikram Sharma", joined_at: today.toISOString(), completed: false, progress: 60 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
  {
    id: "10",
    creator_id: "user5",
    creator_name: "Music Club",
    title: "Learn a New Song",
    description: "Master one complete song on any instrument or vocal. Share your performance with the community!",
    challenge_type: "creative",
    difficulty: "medium",
    points: 180,
    start_date: today.toISOString(),
    end_date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 40,
    completion_password: "MUSIC2024",
    participant_count: 22,
    participants: [
      { user_id: "user1", user_name: "Arjun Patel", joined_at: today.toISOString(), completed: false, progress: 75 },
      { user_id: "user3", user_name: "Priya Singh", joined_at: today.toISOString(), completed: false, progress: 55 },
    ],
    is_active: true,
    created_at: today.toISOString(),
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { user_id: "user1", user_name: "Arjun Patel", total_points: 850, challenges_completed: 5 },
  { user_id: "user2", user_name: "Rahul Kumar", total_points: 720, challenges_completed: 4 },
  { user_id: "user3", user_name: "Priya Singh", total_points: 650, challenges_completed: 4 },
  { user_id: "user4", user_name: "Ananya Reddy", total_points: 580, challenges_completed: 3 },
  { user_id: "user5", user_name: "Vikram Sharma", total_points: 490, challenges_completed: 3 },
];

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard] = useState<LeaderboardEntry[]>([]);

  const addChallenge = (newChallenge: Omit<Challenge, "id" | "creator_id" | "creator_name" | "participant_count" | "participants" | "is_active" | "created_at">) => {
    const challenge: Challenge = {
      ...newChallenge,
      id: `challenge-${Date.now()}`,
      creator_id: "current-user",
      creator_name: "You",
      participant_count: 0,
      participants: [],
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setChallenges([challenge, ...challenges]);
  };

  const updateChallenge = (id: string, updates: Partial<Challenge>) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, ...updates, updated_at: new Date().toISOString() } : challenge
      )
    );
  };

  const deleteChallenge = (id: string) => {
    setChallenges(challenges.filter((challenge) => challenge.id !== id));
  };

  const joinChallenge = (challengeId: string): boolean => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;

    // Check if already joined
    if (challenge.participants.some((p) => p.user_id === "current-user")) return false;

    // Check if full
    if (challenge.max_participants && challenge.participant_count >= challenge.max_participants) return false;

    const newParticipant: ChallengeParticipant = {
      user_id: "current-user",
      user_name: "You",
      joined_at: new Date().toISOString(),
      completed: false,
      progress: 0,
    };

    updateChallenge(challengeId, {
      participants: [...challenge.participants, newParticipant],
      participant_count: challenge.participant_count + 1,
    });

    return true;
  };

  const leaveChallenge = (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    updateChallenge(challengeId, {
      participants: challenge.participants.filter((p) => p.user_id !== "current-user"),
      participant_count: challenge.participant_count - 1,
    });
  };

  const completeChallenge = (challengeId: string, password: string): boolean => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;

    // Verify password
    if (challenge.completion_password !== password) {
      return false;
    }

    const updatedParticipants = challenge.participants.map((p) =>
      p.user_id === "current-user"
        ? { ...p, completed: true, completed_at: new Date().toISOString(), progress: 100 }
        : p
    );

    updateChallenge(challengeId, { participants: updatedParticipants });
    return true;
  };

  const updateProgress = (challengeId: string, progress: number) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const updatedParticipants = challenge.participants.map((p) =>
      p.user_id === "current-user" ? { ...p, progress: Math.max(0, Math.min(100, progress)) } : p
    );

    updateChallenge(challengeId, { participants: updatedParticipants });
  };

  const getChallengesByType = (type: ChallengeType) => {
    return challenges.filter((c) => c.challenge_type === type);
  };

  const getChallengesByDifficulty = (difficulty: DifficultyLevel) => {
    return challenges.filter((c) => c.difficulty === difficulty);
  };

  const getActiveChallenges = () => {
    return challenges.filter((c) => c.is_active);
  };

  const getUserChallenges = (userId: string) => {
    return challenges.filter((c) => c.creator_id === userId);
  };

  const isParticipant = (challengeId: string, userId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    return challenge ? challenge.participants.some((p) => p.user_id === userId) : false;
  };

  return (
    <ChallengesContext.Provider
      value={{
        challenges,
        leaderboard,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        joinChallenge,
        leaveChallenge,
        completeChallenge,
        updateProgress,
        getChallengesByType,
        getChallengesByDifficulty,
        getActiveChallenges,
        getUserChallenges,
        isParticipant,
      }}
    >
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = () => {
  const context = useContext(ChallengesContext);
  if (!context) {
    throw new Error("useChallenges must be used within a ChallengesProvider");
  }
  return context;
};
