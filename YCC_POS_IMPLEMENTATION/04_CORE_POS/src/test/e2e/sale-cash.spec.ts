import { test, expect } from '@playwright/test'

test.describe('Cash Sale Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS
    await page.goto('/')
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="pos-container"]')
  })

  test('should complete a cash sale successfully', async ({ page }) => {
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
    
    // Step 3: Add items to cart
    // Add first item
    await page.click('[data-testid="product-burger"]')
    await expect(page.locator('[data-testid="cart-item-burger"]')).toBeVisible()
    
    // Add second item
    await page.click('[data-testid="product-fries"]')
    await expect(page.locator('[data-testid="cart-item-fries"]')).toBeVisible()
    
    // Add third item with quantity
    await page.click('[data-testid="product-coke"]')
    await page.click('[data-testid="cart-item-coke"]')
    await page.click('[data-testid="quantity-increment"]')
    await page.click('[data-testid="quantity-increment"]')
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('3')
    
    // Step 4: Verify cart totals
    await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-tax"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible()
    
    // Step 5: Process payment
    await page.click('[data-testid="payment-button"]')
    
    // Select cash payment
    await page.click('[data-testid="payment-method-cash"]')
    
    // Enter payment amount
    await page.fill('[data-testid="payment-amount"]', '50')
    
    // Step 6: Complete sale
    await page.click('[data-testid="complete-sale-button"]')
    
    // Verify sale completion
    await expect(page.locator('[data-testid="sale-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="receipt-preview"]')).toBeVisible()
    
    // Step 7: Print receipt
    await page.click('[data-testid="print-receipt-button"]')
    
    // Verify receipt action
    await expect(page.locator('[data-testid="receipt-printed-message"]')).toBeVisible()
    
    // Step 8: Return to main screen
    await page.click('[data-testid="new-sale-button"]')
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(0)
  })

  test('should handle insufficient cash scenario', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add expensive item
    await page.click('[data-testid="product-steak"]')
    
    // Try to pay with insufficient amount
    await page.click('[data-testid="payment-button"]')
    await page.click('[data-testid="payment-method-cash"]')
    await page.fill('[data-testid="payment-amount"]', '5')
    await page.click('[data-testid="complete-sale-button"]')
    
    // Should show insufficient funds error
    await expect(page.locator('[data-testid="insufficient-funds-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Insufficient payment amount')
  })

  test('should handle item removal from cart', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add multiple items
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="product-fries"]')
    await page.click('[data-testid="product-coke"]')
    
    // Verify all items are in cart
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(3)
    
    // Remove one item
    await page.click('[data-testid="cart-item-fries"]')
    await page.click('[data-testid="remove-item-button"]')
    
    // Verify item is removed
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="cart-item-fries"]')).not.toBeVisible()
    
    // Verify other items remain
    await expect(page.locator('[data-testid="cart-item-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-item-coke"]')).toBeVisible()
  })

  test('should handle quantity modification', async ({ page }) => {
    // Login and open drawer
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
    
    // Add item
    await page.click('[data-testid="product-burger"]')
    
    // Modify quantity
    await page.click('[data-testid="cart-item-burger"]')
    await page.click('[data-testid="quantity-increment"]')
    await page.click('[data-testid="quantity-increment"]')
    await page.click('[data-testid="quantity-increment"]')
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('4')
    
    // Decrease quantity
    await page.click('[data-testid="quantity-decrement"]')
    
    // Verify quantity decreased
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('3')
    
    // Verify total updated accordingly
    const burgerPrice = 12.99
    const expectedTotal = burgerPrice * 3
    const cartTotal = await page.locator('[data-testid="cart-total"]').textContent()
    expect(cartTotal).toContain(expectedTotal.toFixed(2))
  })

  test('should handle discount application', async ({ page }) => {
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
    
    // Apply percentage discount
    await page.click('[data-testid="discount-button"]')
    await page.click('[data-testid="discount-type-percentage"]')
    await page.fill('[data-testid="discount-value"]', '10')
    await page.click('[data-testid="apply-discount"]')
    
    // Verify discount applied
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('less than original total')
    
    // Remove discount
    await page.click('[data-testid="remove-discount"]')
    
    // Verify discount removed
    await expect(page.locator('[data-testid="discount-amount"]')).not.toBeVisible()
  })
})
