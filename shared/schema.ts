import { pgTable, text, serial, integer, boolean, timestamp, decimal, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  balance: decimal("balance", { precision: 10, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  reward: decimal("reward", { precision: 10, scale: 8 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  text: text("text").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  rewardClaimed: boolean("reward_claimed").default(false),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 8 }),
  transactionHash: text("transaction_hash"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  category: one(categories, {
    fields: [quizzes.categoryId],
    references: [categories.id],
  }),
  questions: many(questions),
  attempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, balance: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, completedAt: true });

export const updateUserWalletSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
});

export const submitQuizSchema = z.object({
  quizId: z.number(),
  answers: z.array(z.number()),
});

export const claimRewardSchema = z.object({
  attemptId: z.number(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type UpdateUserWallet = z.infer<typeof updateUserWalletSchema>;
export type SubmitQuiz = z.infer<typeof submitQuizSchema>;
export type ClaimReward = z.infer<typeof claimRewardSchema>;
