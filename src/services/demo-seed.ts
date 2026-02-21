// ===========================================
// DEMO SEED DATA - Pre-populated Bills for Hackathon Demo
// ===========================================
// This seeds the in-memory storage with realistic demo data
// so the dashboard shows pre-populated bills and some completed negotiations.

import {
  createBill,
  createUser,
  updateBill,
  createNegotiation,
  updateNegotiation,
  getUserByEmail,
} from './storage.js';
import { ProviderId, BillCategory } from '../types/index.js';

// Demo user email
const DEMO_USER_EMAIL = 'demo@slash.ai';

// Demo bills data
const DEMO_BILLS = [
  {
    id: 'demo-comcast',
    provider: 'comcast' as ProviderId,
    category: 'internet' as BillCategory,
    monthlyRate: 129.99,
    planName: 'Xfinity Performance Pro+',
    accountNumber: 'DEMO-8847291',
    status: 'active', // ready to negotiate
  },
  {
    id: 'demo-att',
    provider: 'att_wireless' as ProviderId,
    category: 'cell_phone' as BillCategory,
    monthlyRate: 185.00,
    planName: 'AT&T Unlimited Premium (2 lines)',
    accountNumber: 'DEMO-3391047',
    status: 'active', // ready to negotiate
  },
  {
    id: 'demo-statefarm',
    provider: 'state_farm' as ProviderId,
    category: 'insurance' as BillCategory,
    monthlyRate: 247.00,
    planName: 'Auto + Renters Bundle',
    accountNumber: 'DEMO-SF-92841',
    status: 'active', // Will be marked as "negotiated" after seeding
    savedAmount: 47.00,
    newRate: 200.00,
  },
  {
    id: 'demo-spectrum',
    provider: 'spectrum' as ProviderId,
    category: 'internet' as BillCategory,
    monthlyRate: 89.99,
    planName: 'Spectrum Internet Ultra',
    accountNumber: 'DEMO-7712934',
    status: 'active', // ready to negotiate
  },
  {
    id: 'demo-tmobile',
    provider: 'tmobile' as ProviderId,
    category: 'cell_phone' as BillCategory,
    monthlyRate: 140.00,
    planName: 'T-Mobile Go5G Plus (3 lines)',
    accountNumber: 'DEMO-TM-55821',
    status: 'active', // Will be marked as "negotiated" after seeding
    savedAmount: 30.00,
    newRate: 110.00,
  },
];

let demoSeeded = false;

/**
 * Seed demo bills into storage
 * Creates a demo user if not exists, then adds demo bills
 */
export function seedDemoBills(): { userId: string; billsCreated: number } {
  if (demoSeeded) {
    console.log('Demo data already seeded');
    return { userId: '', billsCreated: 0 };
  }

  // Create or get demo user
  let user = getUserByEmail(DEMO_USER_EMAIL);
  if (!user) {
    user = createUser({
      email: DEMO_USER_EMAIL,
      password: 'demo123',
      phone: '+15551234567',
    });
    console.log(`Created demo user: ${user.id}`);
  }

  // Clear any existing initializeSampleData by checking for demo bills
  // We'll add our demo bills
  
  let billsCreated = 0;

  for (const demoBill of DEMO_BILLS) {
    // Create the bill
    const bill = createBill(user.id, {
      provider: demoBill.provider,
      category: demoBill.category,
      accountNumber: demoBill.accountNumber,
      currentRate: demoBill.monthlyRate,
      planName: demoBill.planName,
    });

    billsCreated++;

    // For bills with savings, create a successful negotiation
    if (demoBill.savedAmount && demoBill.newRate) {
      const negotiation = createNegotiation(bill.id, user.id, demoBill.monthlyRate);
      
      updateNegotiation(negotiation.id, {
        status: 'success',
        newRate: demoBill.newRate,
        monthlySavings: demoBill.savedAmount,
        totalSavings: demoBill.savedAmount * 12, // 12 months
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random recent date
      });

      // Mark bill as negotiated (update status)
      updateBill(bill.id, { status: 'negotiating' });
    }
  }

  demoSeeded = true;
  console.log(`Seeded ${billsCreated} demo bills for user ${user.id}`);

  return { userId: user.id, billsCreated };
}

/**
 * Check if demo data has been seeded
 */
export function isDemoSeeded(): boolean {
  return demoSeeded;
}

/**
 * Reset demo seeding (for testing)
 */
export function resetDemoSeed(): void {
  demoSeeded = false;
}

/**
 * Get demo user ID
 */
export function getDemoUserId(): string | undefined {
  const user = getUserByEmail(DEMO_USER_EMAIL);
  return user?.id;
}
