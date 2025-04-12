import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { aptosService } from "./aptos";
import { ZodError } from "zod";
import { 
  submitQuizSchema, claimRewardSchema,
  updateUserWalletSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  // Quizzes routes
  app.get("/api/quizzes", async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (categoryId) {
        const quizzes = await storage.getQuizzesByCategory(categoryId);
        res.json(quizzes);
      } else {
        const quizzes = await storage.getQuizzes();
        res.json(quizzes);
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/quizzes/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuizById(id);
      
      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }
      
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  });

  // Quiz questions route
  app.get("/api/quizzes/:id/questions", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const quizId = parseInt(req.params.id);
      
      // First check if the quiz exists
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }
      
      const questions = await storage.getQuestionsByQuiz(quizId);
      
      // Remove correct answers for security
      const sanitizedQuestions = questions.map(q => {
        const { correctOption, ...rest } = q;
        return rest;
      });
      
      res.json(sanitizedQuestions);
    } catch (error) {
      next(error);
    }
  });

  // Submit quiz answers
  app.post("/api/quizzes/:id/submit", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const quizId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Validate request body
      const validatedData = submitQuizSchema.parse({
        quizId,
        answers: req.body.answers
      });
      
      // Get the quiz
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }
      
      // Get the questions with correct answers
      const questions = await storage.getQuestionsByQuiz(quizId);
      if (questions.length !== validatedData.answers.length) {
        return res.status(400).send("Invalid number of answers");
      }
      
      // Calculate score
      let score = 0;
      for (let i = 0; i < questions.length; i++) {
        if (questions[i].correctOption === validatedData.answers[i]) {
          score++;
        }
      }
      
      // Calculate reward based on score
      const rewardPercentage = score / questions.length;
      const rewardAmount = (parseFloat(quiz.reward.toString()) * rewardPercentage).toFixed(8);
      
      // Create quiz attempt record
      const attempt = await storage.createQuizAttempt({
        userId,
        quizId,
        score,
        rewardAmount,
        rewardClaimed: false
      });
      
      res.status(201).json({
        attemptId: attempt.id,
        score,
        totalQuestions: questions.length,
        rewardAmount
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Quiz attempts routes
  app.get("/api/quiz-attempts", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const attempts = await storage.getQuizAttemptsByUser(req.user.id);
      res.json(attempts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/quiz-attempts/:id", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const id = parseInt(req.params.id);
      const attempt = await storage.getQuizAttemptById(id);
      
      // Only allow users to view their own attempts
      if (!attempt || attempt.userId !== req.user.id) {
        return res.status(404).send("Quiz attempt not found");
      }
      
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  });

  // User wallet routes
  app.put("/api/user/wallet", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      // Validate request body
      const validatedData = updateUserWalletSchema.parse(req.body);
      
      // Update user wallet
      const user = await storage.updateUserWallet(req.user.id, validatedData.walletAddress);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Claim reward route
  app.post("/api/rewards/claim/:attemptId", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      // Validate request params
      const validatedData = claimRewardSchema.parse({
        attemptId: parseInt(req.params.attemptId)
      });
      
      // Get the quiz attempt
      const attempt = await storage.getQuizAttemptById(validatedData.attemptId);
      
      if (!attempt) {
        return res.status(404).send("Quiz attempt not found");
      }
      
      // Check if the attempt belongs to the user
      if (attempt.userId !== req.user.id) {
        return res.status(403).send("Unauthorized");
      }
      
      // Check if the reward has already been claimed
      if (attempt.rewardClaimed) {
        return res.status(400).send("Reward already claimed");
      }
      
      // Check if user has a wallet address
      if (!req.user.walletAddress) {
        return res.status(400).send("Wallet address not connected");
      }
      
      // Transfer the reward to the user's wallet
      const result = await aptosService.transferApt(
        req.user.walletAddress,
        attempt.rewardAmount?.toString() || "0",
        attempt.id
      );
      
      // Update user balance
      await storage.updateUserBalance(req.user.id, attempt.rewardAmount?.toString() || "0");
      
      res.json({
        success: true,
        transactionHash: result.transactionHash,
        simulated: result.simulated || false,
        message: result.simulated ? "Reward claimed in simulation mode (platform wallet not funded on devnet)" : "Reward claimed successfully"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // User stats route
  app.get("/api/user/stats", async (req, res, next) => {
    try {
      // Authenticated users only
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
