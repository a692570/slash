// ===========================================
// API ROUTES - Express Router
// ===========================================

import { Router, Request, Response } from 'express';
import {
  createBill,
  getBill,
  getUserBills,
  updateBill,
  deleteBill,
  updateBillStatus,
  createNegotiation,
  getNegotiation,
  getUserNegotiations,
  updateNegotiation,
  updateNegotiationStatus,
  getDashboardData,
  createUser,
  getUser,
  getUserByEmail,
} from '../services/storage.js';
import { researchCompetitorRates } from '../services/research.js';
import { buildStrategy } from '../services/strategy.js';
import { initiateCall, handleWebhook } from '../services/voice.js';
import {
  BillCreateInput,
  BillUpdateInput,
  UserCreateInput,
  NegotiationResponse,
  BillResponse,
} from '../types/index.js';

const router = Router();

// Helper to get user ID from header
function getUserId(req: Request): string | undefined {
  const userId = req.headers['x-user-id'];
  return typeof userId === 'string' ? userId : undefined;
}

// ===========================================
// AUTH ROUTES (MVP - simple, no real auth)
// ===========================================

/**
 * POST /api/auth/register - Create account
 */
router.post('/auth/register', (req: Request, res: Response): void => {
  try {
    const input: UserCreateInput = req.body;
    
    if (!input.email || !input.password || !input.phone) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and phone are required',
      });
      return;
    }
    
    // Check if user exists
    const existing = getUserByEmail(input.email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'User already exists',
      });
      return;
    }
    
    const user = createUser(input);
    
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login - Login (MVP - returns user)
 */
router.post('/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }
    
    // For MVP, accept any password
    const user = getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/auth/me - Get current user (MVP - uses userId header)
 */
router.get('/auth/me', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const user = getUser(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ===========================================
// BILL ROUTES
// ===========================================

/**
 * GET /api/bills - List user's bills
 */
router.get('/bills', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const bills = getUserBills(userId);
    const response: BillResponse[] = bills.map(bill => ({
      id: bill.id,
      provider: bill.provider,
      accountNumber: bill.accountNumber,
      currentRate: bill.currentRate,
      planName: bill.planName,
      billDate: bill.billDate,
      status: bill.status,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString(),
    }));
    
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('List bills error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/bills - Add a bill
 */
router.post('/bills', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const input: BillCreateInput = req.body;
    
    if (!input.provider || !input.accountNumber || !input.currentRate) {
      res.status(400).json({
        success: false,
        error: 'Provider, account number, and current rate are required',
      });
      return;
    }
    
    const bill = createBill(userId, input);
    
    res.status(201).json({
      success: true,
      data: {
        id: bill.id,
        provider: bill.provider,
        accountNumber: bill.accountNumber,
        currentRate: bill.currentRate,
        planName: bill.planName,
        billDate: bill.billDate,
        status: bill.status,
        createdAt: bill.createdAt.toISOString(),
        updatedAt: bill.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/bills/:id - Get bill details
 */
router.get('/bills/:id', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    const id = String(req.params.id);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const bill = getBill(id);
    
    if (!bill || bill.userId !== userId) {
      res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: bill.id,
        provider: bill.provider,
        accountNumber: bill.accountNumber,
        currentRate: bill.currentRate,
        planName: bill.planName,
        billDate: bill.billDate,
        status: bill.status,
        createdAt: bill.createdAt.toISOString(),
        updatedAt: bill.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/bills/:id - Update bill
 */
router.put('/bills/:id', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    const id = String(req.params.id);
    const input: BillUpdateInput = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const existing = getBill(id);
    if (!existing || existing.userId !== userId) {
      res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
      return;
    }
    
    const updated = updateBill(id, input);
    
    if (!updated) {
      res.status(500).json({
        success: false,
        error: 'Failed to update bill',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: updated.id,
        provider: updated.provider,
        accountNumber: updated.accountNumber,
        currentRate: updated.currentRate,
        planName: updated.planName,
        billDate: updated.billDate,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/bills/:id - Remove bill
 */
router.delete('/bills/:id', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    const id = String(req.params.id);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const existing = getBill(id);
    if (!existing || existing.userId !== userId) {
      res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
      return;
    }
    
    const deleted = deleteBill(id);
    
    if (!deleted) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete bill',
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Bill deleted',
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/bills/:id/negotiate - Start negotiation
 */
router.post('/bills/:id/negotiate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = String(req.params.id);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const bill = getBill(id);
    if (!bill || bill.userId !== userId) {
      res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
      return;
    }
    
    if (bill.status === 'negotiating') {
      res.status(409).json({
        success: false,
        error: 'Negotiation already in progress',
      });
      return;
    }
    
    // Update bill status to negotiating
    updateBillStatus(id, 'negotiating');
    
    // Create negotiation record
    const negotiation = createNegotiation(id, userId, bill.currentRate);
    
    // Start research phase
    updateNegotiationStatus(negotiation.id, 'researching');
    
    // Research competitor rates
    const competitorRates = await researchCompetitorRates(bill.provider, bill.currentRate);
    
    // Build strategy
    const strategy = buildStrategy(bill, competitorRates);
    
    // Update negotiation with research and strategy
    updateNegotiation(negotiation.id, {
      competitorRates,
      selectedTactics: strategy.tactics,
      status: 'calling',
    });
    
    // In production, initiate the call here
    // For MVP, we'll just return the negotiation
    try {
      const callResult = await initiateCall({
        ...negotiation,
        competitorRates,
        selectedTactics: strategy.tactics,
        status: 'calling',
      });
      
      updateNegotiation(negotiation.id, {
        telnyxCallId: callResult.callId,
        startedAt: new Date(),
        status: 'negotiating',
      });
    } catch (callError) {
      console.error('Call initiation failed:', callError);
      // Continue anyway - for demo purposes
      updateNegotiation(negotiation.id, {
        startedAt: new Date(),
        status: 'negotiating',
      });
    }
    
    const updatedNeg = getNegotiation(negotiation.id);
    
    res.status(202).json({
      success: true,
      data: {
        negotiationId: negotiation.id,
        status: updatedNeg?.status || 'calling',
        estimatedDuration: '5-10 minutes',
        strategy: {
          primaryTactic: strategy.primaryTactic,
          expectedSavings: strategy.expectedSavings,
        },
      },
    });
  } catch (error) {
    console.error('Negotiate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ===========================================
// NEGOTIATION ROUTES
// ===========================================

/**
 * GET /api/negotiations - List user's negotiations
 */
router.get('/negotiations', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const negotiations = getUserNegotiations(userId);
    const response: NegotiationResponse[] = negotiations.map(neg => ({
      id: neg.id,
      billId: neg.billId,
      status: neg.status,
      originalRate: neg.originalRate,
      newRate: neg.newRate,
      monthlySavings: neg.monthlySavings,
      attempts: neg.attempts,
      createdAt: neg.createdAt.toISOString(),
    }));
    
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('List negotiations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/negotiations/:id - Get negotiation status
 */
router.get('/negotiations/:id', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    const id = String(req.params.id);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const negotiation = getNegotiation(id);
    
    if (!negotiation || negotiation.userId !== userId) {
      res.status(404).json({
        success: false,
        error: 'Negotiation not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: negotiation.id,
        billId: negotiation.billId,
        status: negotiation.status,
        originalRate: negotiation.originalRate,
        newRate: negotiation.newRate,
        monthlySavings: negotiation.monthlySavings,
        totalSavings: negotiation.totalSavings,
        attempts: negotiation.attempts,
        startedAt: negotiation.startedAt?.toISOString(),
        completedAt: negotiation.completedAt?.toISOString(),
        createdAt: negotiation.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get negotiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ===========================================
// DASHBOARD ROUTES
// ===========================================

/**
 * GET /api/dashboard - Get dashboard stats
 */
router.get('/dashboard', (req: Request, res: Response): void => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }
    
    const dashboard = getDashboardData(userId);
    
    if (!dashboard) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ===========================================
// WEBHOOK ROUTES
// ===========================================

/**
 * POST /api/webhooks/telnyx - Handle Telnyx call events
 */
router.post('/webhooks/telnyx', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;
    
    console.log('Received Telnyx webhook:', event);
    
    const result = await handleWebhook(event);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
});

export default router;