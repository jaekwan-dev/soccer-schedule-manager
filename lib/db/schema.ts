import { pgTable, text, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  venue: text('venue').notNull(),
  voteDeadline: text('vote_deadline').notNull(),
  voteDeadlineTime: text('vote_deadline_time').notNull().default('23:59'),
  maxAttendees: integer('max_attendees').notNull().default(20),
  attendanceVotes: json('attendance_votes').$type<{
    attend: number;
    absent: number;
  }>().notNull().default({ attend: 0, absent: 0 }),
  voters: json('voters').$type<Array<{
    name: string;
    vote: 'attend' | 'absent';
    votedAt: string;
  }>>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const members = pgTable('members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  level: integer('level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull(),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert; 