import { test, expect } from '@playwright/test'

test.describe('Product Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS
    await page.goto('/')
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="pos-container"]')
    
    // Login
    await page.fill('[data-testid="email-input"]', 'cashier@yccpos.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Wait for login to complete
    await page.waitForSelector('[data-testid="pos-interface"]')
    
    // Open cash drawer
    await page.click('[data-testid="open-cash-drawer"]')
    await page.fill('[data-testid="opening-amount"]', '100')
    await page.click('[data-testid="confirm-open-drawer"]')
  })

  test('should search products by name', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search for "burger"
    await page.fill('[data-testid="product-search-input"]', 'burger')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    
    // Should filter out non-matching products
    await expect(page.locator('[data-testid="product-fries"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="product-coke"]')).not.toBeVisible()
    
    // Clear search
    await page.click('[data-testid="clear-search"]')
    
    // Should show all products again
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-fries"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-coke"]')).toBeVisible()
  })

  test('should search products by SKU', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search by SKU
    await page.fill('[data-testid="product-search-input"]', 'BURG-001')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Verify search results
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-results"]')).toHaveCount(1)
  })

  test('should search products by category', async ({ page }) => {
    // Click on category filter
    await page.click('[data-testid="category-filter"]')
    
    // Select "FOOD" category
    await page.click('[data-testid="category-food"]')
    
    // Verify food products are shown
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-pizza"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-steak"]')).toBeVisible()
    
    // Should hide beverage products
    await expect(page.locator('[data-testid="product-coke"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="product-juice"]')).not.toBeVisible()
    
    // Clear category filter
    await page.click('[data-testid="clear-category-filter"]')
    
    // Should show all products again
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-coke"]')).toBeVisible()
  })

  test('should handle no search results', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search for non-existent product
    await page.fill('[data-testid="product-search-input"]', 'nonexistentproduct')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('No products found')
    
    // Should show suggestion
    await expect(page.locator('[data-testid="search-suggestion"]')).toBeVisible()
  })

  test('should add product to cart from search results', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search for "burger"
    await page.fill('[data-testid="product-search-input"]', 'burger')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Add product from search results
    await page.click('[data-testid="product-burger"]')
    
    // Verify product is added to cart
    await expect(page.locator('[data-testid="cart-item-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(1)
    
    // Clear search
    await page.click('[data-testid="clear-search"]')
    
    // Cart should still contain the item
    await expect(page.locator('[data-testid="cart-item-burger"]')).toBeVisible()
  })

  test('should handle search with special characters', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search with special characters
    await page.fill('[data-testid="product-search-input"]', 'Burger & Fries')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Should handle special characters properly
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  test('should search case-insensitively', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search with lowercase
    await page.fill('[data-testid="product-search-input"]', 'burger')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Should find product
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    
    // Clear and search with uppercase
    await page.click('[data-testid="clear-search"]')
    await page.fill('[data-testid="product-search-input"]', 'BURGER')
    
    // Should still find product
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    
    // Clear and search with mixed case
    await page.click('[data-testid="clear-search"]')
    await page.fill('[data-testid="product-search-input"]', 'BuRgEr')
    
    // Should still find product
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
  })

  test('should handle partial search matches', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search for partial match
    await page.fill('[data-testid="product-search-input"]', 'bur')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Should find products containing "bur"
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
    
    // Should not find products without "bur"
    await expect(page.locator('[data-testid="product-fries"]')).not.toBeVisible()
  })

  test('should show search history', async ({ page }) => {
    // Perform some searches
    await page.click('[data-testid="product-search-input"]')
    await page.fill('[data-testid="product-search-input"]', 'burger')
    await page.click('[data-testid="clear-search"]')
    
    await page.click('[data-testid="product-search-input"]')
    await page.fill('[data-testid="product-search-input"]', 'fries')
    await page.click('[data-testid="clear-search"]')
    
    // Click on search input again
    await page.click('[data-testid="product-search-input"]')
    
    // Should show search history
    await expect(page.locator('[data-testid="search-history"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-history-item-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-history-item-fries"]')).toBeVisible()
    
    // Click on history item
    await page.click('[data-testid="search-history-item-burger"]')
    
    // Should populate search with history item
    await expect(page.locator('[data-testid="product-search-input"]')).toHaveValue('burger')
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
  })

  test('should handle rapid search typing', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Type rapidly
    await page.fill('[data-testid="product-search-input"]', 'b', { delay: 50 })
    await page.fill('[data-testid="product-search-input"]', 'bu', { delay: 50 })
    await page.fill('[data-testid="product-search-input"]', 'bur', { delay: 50 })
    await page.fill('[data-testid="product-search-input"]', 'burg', { delay: 50 })
    await page.fill('[data-testid="product-search-input"]', 'burge', { delay: 50 })
    await page.fill('[data-testid="product-search-input"]', 'burger', { delay: 50 })
    
    // Should handle rapid typing without errors
    await expect(page.locator('[data-testid="product-burger"]')).toBeVisible()
  })

  test('should maintain search when adding items to cart', async ({ page }) => {
    // Click on search input
    await page.click('[data-testid="product-search-input"]')
    
    // Search for "burger"
    await page.fill('[data-testid="product-search-input"]', 'burger')
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Add product to cart
    await page.click('[data-testid="product-burger"]')
    
    // Search should remain active
    await expect(page.locator('[data-testid="product-search-input"]')).toHaveValue('burger')
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    
    // Should be able to add another item from search
    await page.click('[data-testid="product-burger"]')
    
    // Cart should have 2 items
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(2)
  })
})
