import { 
  users, categories, quizzes, questions, quizAttempts,
  type User, type InsertUser, type Category, type InsertCategory,
  type Quiz, type InsertQuiz, type Question, type InsertQuestion,
  type QuizAttempt, type InsertQuizAttempt
} from "@shared/schema";

import { db } from "./db";
import { eq, and, gt, lt, desc, asc, count, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, walletAddress: string): Promise<User | undefined>;
  updateUserBalance(userId: number, amount: string): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuizzesByCategory(categoryId: number): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;

  // Question operations
  getQuestionsByQuiz(quizId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Quiz Attempt operations
  getQuizAttempts(): Promise<QuizAttempt[]>;
  getQuizAttemptById(id: number): Promise<QuizAttempt | undefined>;
  getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  markRewardAsClaimed(attemptId: number, transactionHash: string): Promise<QuizAttempt | undefined>;
  
  // Stats operations
  getUserStats(userId: number): Promise<any>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserWallet(userId: number, walletAddress: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, amount: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${amount}`,
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Quiz operations
  async getQuizzes(): Promise<Quiz[]> {
    return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.categoryId, categoryId));
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  // Question operations
  async getQuestionsByQuiz(quizId: number): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  // Quiz Attempt operations
  async getQuizAttempts(): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).orderBy(desc(quizAttempts.completedAt));
  }

  async getQuizAttemptById(id: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return attempt;
  }

  async getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async markRewardAsClaimed(attemptId: number, transactionHash: string): Promise<QuizAttempt | undefined> {
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set({ rewardClaimed: true, transactionHash })
      .where(eq(quizAttempts.id, attemptId))
      .returning();
    return updatedAttempt;
  }

  // Stats operations
  async getUserStats(userId: number): Promise<any> {
    const quizzesTakenPromise = db
      .select({ count: count() })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    const totalQuestionsPromise = db
      .select({
        sum: sql<number>`SUM(${quizzes.questionCount})`,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(eq(quizAttempts.userId, userId));

    const totalCorrectPromise = db
      .select({
        sum: sql<number>`SUM(${quizAttempts.score})`,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    const aptsEarnedPromise = db
      .select({
        sum: sql<string>`SUM(${quizAttempts.rewardAmount})`,
      })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.rewardClaimed, true)));

    const [quizzesTaken, totalQuestions, totalCorrect, aptsEarned] = await Promise.all([
      quizzesTakenPromise,
      totalQuestionsPromise,
      totalCorrectPromise,
      aptsEarnedPromise,
    ]);

    const successRate = totalQuestions[0]?.sum && totalQuestions[0].sum > 0
      ? Math.round((totalCorrect[0]?.sum || 0) / totalQuestions[0].sum * 100)
      : 0;

    return {
      quizzesTaken: quizzesTaken[0]?.count || 0,
      successRate: successRate,
      aptsEarned: aptsEarned[0]?.sum || "0",
      knowledgeScore: (totalCorrect[0]?.sum || 0) * 10, // Simple score calculation
    };
  }
}

export const storage = new DatabaseStorage();
