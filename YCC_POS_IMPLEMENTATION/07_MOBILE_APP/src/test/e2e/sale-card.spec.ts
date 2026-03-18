import { test, expect } from '@playwright/test'

test.describe('Card Sale Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS
    await page.goto('/')
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="pos-container"]')
  })

  test('should complete a card sale successfully', async ({ page }) => {
    // Step 1: Login
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Wait for login to complete
    await page.waitForSelector('[data-testid="pos-interface"]')
    
    // Step 2: Open cash drawer
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Step 3: Add items to cart
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="product-fries"]')
    await page.click('[data-testid="product-coke"]')
    
    // Step 4: Process card payment
    await page.click('[data-testid="payment-button"]')
    
    // Select card payment
    await page.click('[data-testid="payment-method-card"]')
    
    // Step 5: Simulate card terminal interaction
    await expect(page.locator('[data-testid="card-terminal-interface"]')).toBeVisible()
    
    // Simulate card insertion/swipe
    await page.click('[data-testid="simulate-card-insert"]')
    
    // Wait for card processing
    await page.waitForSelector('[data-testid="card-processing"]')
    
    // Simulate successful card authorization
    await page.click('[data-testid="simulate-card-approval"]')
    
    // Step 6: Complete sale
    await page.click('[data-testid="complete-sale-button"]')
    
    // Verify sale completion
    await expect(page.locator('[data-testid="sale-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="receipt-preview"]')).toBeVisible()
    
    // Verify card payment indicator
    await expect(page.locator('[data-testid="payment-method-indicator"]')).toContainText('CARD')
    
    // Step 7: Print receipt
    await page.click('[data-testid="print-receipt-button"]')
    
    // Verify receipt action
    await expect(page.locator('[data-testid="receipt-printed-message"]')).toBeVisible()
    
    // Step 8: Return to main screen
    await page.click('[data-testid="new-sale-button"]')
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible()
  })

  test('should handle card decline scenario', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add item
    await page.click('[data-testid="product-burger"]')
    
    // Try card payment
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-card"]')
    
    // Simulate card insertion
    await page.click('[data-testid="simulate-card-insert"]')
    
    // Simulate card decline
    await page.click('[data-testid="simulate-card-decline"]')
    
    // Verify decline message
    await expect(page.locator('[data-testid="card-decline-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Card declined')
    
    // Should return to payment options
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible()
    
    // Should be able to try different payment method
    await page.click('[data-testid="payment-method-cash"]')
    await expect(page.locator('[data-testid="cash-payment-interface"]')).toBeVisible()
  })

  test('should handle card timeout scenario', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add item
    await page.click('[data-testid="product-burger"]')
    
    // Try card payment
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-card"]')
    
    // Simulate card insertion
    await page.click('[data-testid="simulate-card-insert"]')
    
    // Simulate timeout
    await page.click('[data-testid="simulate-card-timeout"]')
    
    // Verify timeout message
    await expect(page.locator('[data-testid="card-timeout-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Transaction timeout')
    
    // Should return to payment options
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible()
  })

  test('should handle card payment with tip', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add items
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="product-fries"]')
    
    // Process card payment
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-card"]')
    
    // Simulate card insertion
    await page.click('[data-testid="simulate-card-insert"]')
    
    // Wait for card processing
    await page.waitForSelector('[data-testid="card-processing"]')
    
    // Simulate card approval with tip prompt
    await page.click('[data-testid="simulate-card-approval-with-tip"]')
    
    // Should show tip options
    await expect(page.locator('[data-testid="tip-options"]')).toBeVisible()
    
    // Select tip percentage
    await page.click('[data-testid="tip-15-percent"]')
    
    // Complete sale with tip
    await page.click('[data-testid="complete-sale-with-tip"]')
    
    // Verify sale completion with tip
    await expect(page.locator('[data-testid="sale-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="tip-amount"]')).toBeVisible()
    
    // Verify receipt shows tip
    await expect(page.locator('[data-testid="receipt-tip-line"]')).toBeVisible()
  })

  test('should handle split payment with card and cash', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add expensive items
    await page.click('[data-testid="product-steak"]')
    await page.click('[data-testid="product-lobster"]')
    
    // Start split payment
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="split-payment-button"]')
    
    // First payment: Card
    await page.click('[data-testid="payment-method-card"]')
    await page.fill('[data-testid="split-amount"]', '50')
    await page.click('[data-testid="apply-split-payment"]')
    
    // Simulate card approval
    await page.click('[data-testid="simulate-card-insert"]')
    await page.click('[data-testid="simulate-card-approval"]')
    
    // Second payment: Cash
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="cash-amount"]', '25')
    await page.click('[data-testid="apply-cash-payment"]')
    
    // Complete split sale
    await page.click('[data-testid="complete-split-sale"]')
    
    // Verify sale completion
    await expect(page.locator('[data-testid="sale-success-message"]')).toBeVisible()
    
    // Verify split payment details
    await expect(page.locator('[data-testid="card-payment-amount"]')).toContainText('50.00')
    await expect(page.locator('[data-testid="cash-payment-amount"]')).toContainText('25.00')
    
    // Verify receipt shows split payments
    await expect(page.locator('[data-testid="receipt-card-payment"]')).toBeVisible()
    await expect(page.locator('[data-testid="receipt-cash-payment"]')).toBeVisible()
  })
})
