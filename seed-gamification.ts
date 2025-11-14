import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGamificationData() {
  console.log('Seeding gamification data...');

  try {
    // Create badges
    const badges = await Promise.all([
      prisma.badge.create({
        data: {
          name: 'First Session',
          description: 'Complete your first learning session',
          icon: '🎯',
          category: 'ACADEMIC',
          rarity: 'common',
          pointsValue: 10,
          criteria: JSON.stringify({ type: 'session_completed', count: 1 })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Quick Learner',
          description: 'Complete 5 sessions in one week',
          icon: '⚡',
          category: 'ACADEMIC',
          rarity: 'rare',
          pointsValue: 25,
          criteria: JSON.stringify({ type: 'sessions_in_week', count: 5 })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Subject Master',
          description: 'Complete 20 sessions in the same subject',
          icon: '🎓',
          category: 'ACADEMIC',
          rarity: 'epic',
          pointsValue: 50,
          criteria: JSON.stringify({ type: 'subject_mastery', count: 20 })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Social Butterfly',
          description: 'Participate in 10 group sessions',
          icon: '🦋',
          category: 'SOCIAL',
          rarity: 'rare',
          pointsValue: 30,
          criteria: JSON.stringify({ type: 'group_sessions', count: 10 })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Early Bird',
          description: 'Complete 5 sessions before 9 AM',
          icon: '🌅',
          category: 'SPECIAL',
          rarity: 'uncommon',
          pointsValue: 15,
          criteria: JSON.stringify({ type: 'early_sessions', count: 5, time: '09:00' })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Night Owl',
          description: 'Complete 5 sessions after 8 PM',
          icon: '🌙',
          category: 'SPECIAL',
          rarity: 'uncommon',
          pointsValue: 15,
          criteria: JSON.stringify({ type: 'late_sessions', count: 5, time: '20:00' })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Perfect Attendance',
          description: 'Maintain a 30-day learning streak',
          icon: '🔥',
          category: 'ACHIEVEMENT',
          rarity: 'legendary',
          pointsValue: 100,
          criteria: JSON.stringify({ type: 'streak_days', count: 30 })
        }
      }),
      prisma.badge.create({
        data: {
          name: 'Homework Hero',
          description: 'Submit 10 homework assignments',
          icon: '📝',
          category: 'ACADEMIC',
          rarity: 'common',
          pointsValue: 20,
          criteria: JSON.stringify({ type: 'homework_submitted', count: 10 })
        }
      })
    ]);

    console.log(`Created ${badges.length} badges`);

    // Create achievements
    const achievements = await Promise.all([
      prisma.achievement.create({
        data: {
          name: 'First Steps',
          description: 'Complete your first learning session',
          type: 'SESSION_COMPLETED',
          icon: '👣',
          points: 10,
          criteria: JSON.stringify({ type: 'session_completed', count: 1 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Dedicated Learner',
          description: 'Complete 10 learning sessions',
          type: 'SESSION_COMPLETED',
          icon: '📚',
          points: 25,
          criteria: JSON.stringify({ type: 'session_completed', count: 10 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Session Master',
          description: 'Complete 50 learning sessions',
          type: 'SESSION_COMPLETED',
          icon: '🎓',
          points: 100,
          criteria: JSON.stringify({ type: 'session_completed', count: 50 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Homework Champion',
          description: 'Submit 5 homework assignments',
          type: 'CONSISTENT_LEARNER',
          icon: '📖',
          points: 15,
          criteria: JSON.stringify({ type: 'homework_submitted', count: 5 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Assessment Ace',
          description: 'Pass 3 assessments with high scores',
          type: 'TOP_PERFORMER',
          icon: '🏆',
          points: 30,
          criteria: JSON.stringify({ type: 'assessment_passed', count: 3, min_score: 80 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Week Warrior',
          description: 'Complete sessions 7 days in a row',
          type: 'CONSISTENT_LEARNER',
          icon: '🗓️',
          points: 40,
          criteria: JSON.stringify({ type: 'daily_streak', count: 7 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Month Master',
          description: 'Complete sessions 30 days in a row',
          type: 'CONSISTENT_LEARNER',
          icon: '📅',
          points: 150,
          criteria: JSON.stringify({ type: 'daily_streak', count: 30 })
        }
      }),
      prisma.achievement.create({
        data: {
          name: 'Review Star',
          description: 'Receive 5 positive reviews',
          type: 'REVIEW_COLLECTOR',
          icon: '⭐',
          points: 20,
          criteria: JSON.stringify({ type: 'reviews_received', count: 5, min_rating: 4 })
        }
      })
    ]);

    console.log(`Created ${achievements.length} achievements`);

    // Create rewards
    const rewards = await Promise.all([
      prisma.reward.create({
        data: {
          name: '10% Session Discount',
          description: 'Get 10% off your next tutoring session',
          type: 'discount',
          value: 500,
          metadata: JSON.stringify({ discount_percent: 10, max_uses: 1 })
        }
      }),
      prisma.reward.create({
        data: {
          name: 'Study Materials Pack',
          description: 'Access premium study resources and materials',
          type: 'digital_content',
          value: 1000,
          metadata: JSON.stringify({ content_type: 'study_materials', duration_days: 30 })
        }
      }),
      prisma.reward.create({
        data: {
          name: 'Priority Booking',
          description: 'Get priority access to book sessions with popular tutors',
          type: 'feature_unlock',
          value: 2000,
          metadata: JSON.stringify({ feature: 'priority_booking', duration_days: 7 })
        }
      }),
      prisma.reward.create({
        data: {
          name: 'Extended Session',
          description: 'Add 30 minutes to your next session for free',
          type: 'session_bonus',
          value: 750,
          metadata: JSON.stringify({ bonus_minutes: 30, max_uses: 1 })
        }
      }),
      prisma.reward.create({
        data: {
          name: 'Profile Badge',
          description: 'Display a special "Top Learner" badge on your profile',
          type: 'profile_customization',
          value: 1500,
          metadata: JSON.stringify({ badge_type: 'top_learner', duration_days: 30 })
        }
      })
    ]);

    console.log(`Created ${rewards.length} rewards`);

    // Create default leaderboards
    const leaderboards = await Promise.all([
      prisma.leaderboard.create({
        data: {
          name: 'Weekly Points Leaderboard',
          type: 'WEEKLY',
          scope: 'GLOBAL',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      }),
      prisma.leaderboard.create({
        data: {
          name: 'Monthly Points Leaderboard',
          type: 'MONTHLY',
          scope: 'GLOBAL',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }),
      prisma.leaderboard.create({
        data: {
          name: 'All-Time Points Leaderboard',
          type: 'ALL_TIME',
          scope: 'GLOBAL',
          startDate: new Date(),
          endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years from now
        }
      })
    ]);

    console.log(`Created ${leaderboards.length} leaderboards`);

    console.log('Gamification data seeded successfully!');
  } catch (error) {
    console.error('Error seeding gamification data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedGamificationData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });