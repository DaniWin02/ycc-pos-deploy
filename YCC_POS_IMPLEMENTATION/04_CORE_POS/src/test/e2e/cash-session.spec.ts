import { test, expect } from '@playwright/test'

test.describe('Cash Session Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS
    await page.goto('/')
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="pos-container"]')
  })

  test('should complete a full cash session cycle', async ({ page }) => {
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
    
    // Verify cash drawer is open
    await expect(page.locator('[data-testid="cash-drawer-status"]')).toContainText('Open')
    await expect(page.locator('[data-testid="session-start-time"]')).toBeVisible()
    
    // Step 3: Process multiple sales during session
    // Sale 1
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="product-fries"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '30')
    await page.click('[data-testid="complete-sale-button"]')
    await page.click('[data-testid="new-sale-button"]')
    
    // Sale 2
    await page.click('[data-testid="product-coke"]')
    await page.click('[data-testid="product-coke"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '10')
    await page.click('[data-testid="complete-sale-button"]')
    await page.click('[data-testid="new-sale-button"]')
    
    // Sale 3
    await page.click('[data-testid="product-pizza"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '20')
    await page.click('[data-testid="complete-sale-button"]')
    await page.click('[data-testid="new-sale-button"]')
    
    // Step 4: Check session summary
    await page.click('[data-testid="session-summary-button"]')
    
    // Verify session statistics
    await expect(page.locator('[data-testid="session-sales-count"]')).toContainText('3')
    await expect(page.locator('[data-testid="session-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="session-cash-sales"]')).toBeVisible()
    await expect(page.locator('[data-testid="session-duration"]')).toBeVisible()
    
    // Verify transaction list
    await expect(page.locator('[data-testid="transaction-list"]')).toHaveCount(3)
    
    // Step 5: Close cash drawer
    await page.click('[data-testid="close-cash-drawer"]')
    
    // Verify closing interface
    await expect(page.locator('[data-testid="cash-drawer-closing"]')).toBeVisible()
    await expect(page.locator('[data-testid="expected-cash-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="actual-cash-input"]')).toBeVisible()
    
    // Step 6: Enter actual cash amount
    await page.fill('[data-testid="actual-cash-input"]', '60')
    
    // Verify variance calculation
    await expect(page.locator('[data-testid="cash-variance"]')).toBeVisible()
    
    // Step 7: Complete closing process
    await page.click('[data-testid="confirm-close-drawer"]')
    
    // Verify closing completion
    await expect(page.locator('[data-testid="session-closed-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="closing-report"]')).toBeVisible()
    
    // Verify cash drawer status
    await expect(page.locator('[data-testid="cash-drawer-status"]')).toContainText('Closed')
    
    // Step 8: Print closing report
    await page.click('[data-testid="print-closing-report"]')
    
    // Verify report printing
    await expect(page.locator('[data-testid="closing-report-printed"]')).toBeVisible()
    
    // Step 9: Start new session
    await page.click('[data-testid="start-new-session"]')
    
    // Should return to opening screen
    await expect(page.locator('[data-testid="open-cash-drawer"]')).toBeVisible()
  })

  test('should handle cash shortage during closing', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Process a sale
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '20')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Try to close with less cash than expected
    await page.click('[data-testid="close-cash-drawer"]')
    await page.fill('[data-testid="actual-cash-input"]', '110') // Should be 120
    await page.click('[data-testid="confirm-close-drawer"]')
    
    // Should show shortage warning
    await expect(page.locator('[data-testid="cash-shortage-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="shortage-amount"]')).toContainText('10.00')
    
    // Should require confirmation
    await expect(page.locator('[data-testid="confirm-shortage"]')).toBeVisible()
    
    // Confirm shortage
    await page.click('[data-testid="confirm-shortage"]')
    
    // Should complete closing with shortage noted
    await expect(page.locator('[data-testid="session-closed-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="shortage-noted"]')).toBeVisible()
  })

  test('should handle cash overage during closing', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Process a sale
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '20')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Try to close with more cash than expected
    await page.click('[data-testid="close-cash-drawer"]')
    await page.fill('[data-testid="actual-cash-input"]', '130') // Should be 120
    await page.click('[data-testid="confirm-close-drawer"]')
    
    // Should show overage notification
    await expect(page.locator('[data-testid="cash-overage-notification"]')).toBeVisible()
    await expect(page.locator('[data-testid="overage-amount"]')).toContainText('10.00')
    
    // Should require manager approval for large overage
    if (parseFloat(await page.locator('[data-testid="overage-amount"]').textContent()) > 5) {
      await expect(page.locator('[data-testid="manager-approval-required"]')).toBeVisible()
      
      // Simulate manager approval
      await page.fill('[data-testid="manager-pin"]', '1234')
      await page.click('[data-testid="approve-overage"]')
    }
    
    // Should complete closing with overage noted
    await expect(page.locator('[data-testid="session-closed-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="overage-noted"]')).toBeVisible()
  })

  test('should handle session interruption and recovery', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Process some sales
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '20')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Simulate session interruption (app crash/refresh)
    await page.reload()
    
    // Should show session recovery screen
    await expect(page.locator('[data-testid="session-recovery"]')).toBeVisible()
    await expect(page.locator('[data-testid="recover-session-button"]')).toBeVisible()
    
    // Recover session
    await page.click('[data-testid="recover-session-button"]')
    
    // Should restore session state
    await expect(page.locator('[data-testid="cash-drawer-status"]')).toContainText('Open')
    await expect(page.locator('[data-testid="session-sales-count"]')).toContainText('1')
    
    // Should be able to continue operations
    await page.click('[data-testid="product-fries"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '15')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Should be able to close normally
    await page.click('[data-testid="close-cash-drawer"]')
    await page.fill('[data-testid="actual-cash-input"]', '135')
    await page.click('[data-testid="confirm-close-drawer"]')
    
    await expect(page.locator('[data-testid="session-closed-message"]')).toBeVisible()
  })

  test('should handle manager override for session operations', async ({ page }) => {
    // Login as cashier
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Try to open drawer with insufficient permissions
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // If manager approval is required (simulated)
    if (await page.locator('[data-testid="manager-approval-required"]').isVisible()) {
      await expect(page.locator('[data-testid="manager-pin-input"]')).toBeVisible()
      
      // Enter manager PIN
      await page.fill('[data-testid="manager-pin-input"]', '1234')
      await page.click('[data-testid="approve-operation"]')
      
      // Should proceed with opening
      await expect(page.locator('[data-testid="cash-drawer-status"]')).toContainText('Open')
    }
    
    // Process a sale
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '20')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Try to close drawer early (manager approval required)
    await page.click('[data-testid="close-cash-drawer"]')
    
    if (await page.locator('[data-testid="manager-approval-required"]').isVisible()) {
      await page.fill('[data-testid="manager-pin-input"]', '1234')
      await page.click('[data-testid="approve-early-close"]')
      
      // Should proceed with closing
      await page.fill('[data-testid="actual-cash-input"]', '120')
      await page.click('[data-testid="confirm-close-drawer"]')
      
      await expect(page.locator('[data-testid="session-closed-message"]')).toBeVisible()
    }
  })
})
