import { pgTable, text, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  venue: text('venue').notNull(),
  voteDeadline: text('vote_deadline').notNull(),
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

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert; 