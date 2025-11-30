'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { FaUtensils, FaStar, FaChartLine, FaTrophy } from 'react-icons/fa';

interface AnalyticsData {
  period_days: number;
  total_reviews: number;
  overall_average: number;
  ratings_by_meal: { [key: string]: number };
  daily_trends: Array<{
    date: string;
    average_rating: number;
    review_count: number;
  }>;
  rating_distribution: { [key: string]: number };
}

interface PopularDish {
  dish_name: string;
  mention_count: number;
  average_rating: number;
}

export default function MessReviewDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, dishesRes] = await Promise.all([
        apiClient.get(`/api/mess-reviews/analytics/overview?days=${period}`),
        apiClient.get(`/api/mess-reviews/analytics/popular-dishes?days=${period}`),
      ]);
      setAnalytics(analyticsRes.data);
      setPopularDishes(dishesRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealEmoji = (mealType: string) => {
    const emojiMap: { [key: string]: string } = {
      breakfast: '🥐',
      lunch: '🍛',
      snacks: '☕',
      dinner: '🍽️',
    };
    return emojiMap[mealType] || '🍴';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black animate-fade-in p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 flex items-center gap-3">
            <FaUtensils className="text-primary dark:text-secondary" />
            Mess Review Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics and insights from student reviews
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-button font-medium transition ${
                period === days
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Reviews
              </h3>
              <FaChartLine className="text-primary dark:text-secondary" />
            </div>
            <p className="text-3xl font-bold text-black dark:text-white">
              {analytics.total_reviews}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Rating
              </h3>
              <FaStar className="text-yellow-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${getRatingColor(analytics.overall_average)}`}>
                {analytics.overall_average.toFixed(1)}
              </p>
              <span className="text-gray-500 dark:text-gray-500">/5.0</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Popular Dishes
              </h3>
              <FaTrophy className="text-yellow-600 dark:text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-black dark:text-white">
              {popularDishes.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ratings by Meal Type */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-black dark:text-white mb-4">
              Ratings by Meal Type
            </h2>
            <div className="space-y-4">
              {Object.entries(analytics.ratings_by_meal).map(([meal, rating]) => (
                <div key={meal} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMealEmoji(meal)}</span>
                    <span className="text-black dark:text-white capitalize font-medium">
                      {meal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg ${
                            star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-lg font-bold ${getRatingColor(rating)}`}>
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-black dark:text-white mb-4">
              Rating Distribution
            </h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.rating_distribution[rating.toString()] || 0;
                const percentage = analytics.total_reviews
                  ? (count / analytics.total_reviews) * 100
                  : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {rating}
                      </span>
                      <FaStar className="text-yellow-500 text-sm" />
                    </div>
                    <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary dark:bg-secondary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Trends */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">
            Daily Rating Trends
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Rating
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.daily_trends.slice(-14).reverse().map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-hover"
                  >
                    <td className="py-3 px-4 text-sm text-black dark:text-white">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold ${getRatingColor(day.average_rating)}`}>
                        {day.average_rating.toFixed(1)} ★
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                      {day.review_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">
            Most Popular Dishes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDishes.map((dish, index) => (
              <div
                key={dish.dish_name}
                className="bg-gray-50 dark:bg-dark-card rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-dark-hover transition border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-black dark:text-white flex-1">
                    {dish.dish_name}
                  </h3>
                  {index < 3 && (
                    <span className="text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {dish.mention_count} mentions
                  </span>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-xs" />
                    <span className={`font-bold ${getRatingColor(dish.average_rating)}`}>
                      {dish.average_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
