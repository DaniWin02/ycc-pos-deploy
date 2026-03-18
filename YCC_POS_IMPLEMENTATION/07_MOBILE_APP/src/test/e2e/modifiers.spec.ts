import { test, expect } from '@playwright/test'

test.describe('Product Modifiers Functionality', () => {
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

  test('should add modifiers to product', async ({ page }) => {
    // Add a product that has modifiers
    await page.click('[data-testid="product-burger"]')
    
    // Should show modifier selection modal
    await expect(page.locator('[data-testid="modifier-selection-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-categories"]')).toBeVisible()
    
    // Select modifiers from different categories
    // Add cheese
    await page.click('[data-testid="modifier-cheese"]')
    
    // Add bacon
    await page.click('[data-testid="modifier-bacon"]')
    
    // Add extra patty
    await page.click('[data-testid="modifier-extra-patty"]')
    
    // Verify selected modifiers
    await expect(page.locator('[data-testid="selected-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-bacon"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-extra-patty"]')).toBeVisible()
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify product is added to cart with modifiers
    await expect(page.locator('[data-testid="cart-item-burger"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-item-modifiers"]')).toBeVisible()
    
    // Verify modifier details in cart
    await expect(page.locator('[data-testid="cart-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-bacon"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-extra-patty"]')).toBeVisible()
    
    // Verify price includes modifiers
    const basePrice = 12.99
    const cheesePrice = 1.50
    const baconPrice = 2.00
    const extraPattyPrice = 4.00
    const expectedTotal = basePrice + cheesePrice + baconPrice + extraPattyPrice
    
    const cartTotal = await page.locator('[data-testid="cart-total"]').textContent()
    expect(cartTotal).toContain(expectedTotal.toFixed(2))
  })

  test('should remove modifiers from product', async ({ page }) => {
    // Add a product with modifiers
    await page.click('[data-testid="product-burger"]')
    
    // Select multiple modifiers
    await page.click('[data-testid="modifier-cheese"]')
    await page.click('[data-testid="modifier-bacon"]')
    await page.click('[data-testid="modifier-extra-patty"]')
    
    // Remove one modifier
    await page.click('[data-testid="selected-modifier-bacon"]')
    
    // Verify modifier is removed
    await expect(page.locator('[data-testid="selected-modifier-bacon"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-extra-patty"]')).toBeVisible()
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart shows remaining modifiers
    await expect(page.locator('[data-testid="cart-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-extra-patty"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-bacon"]')).not.toBeVisible()
  })

  test('should handle modifier quantity selection', async ({ page }) => {
    // Add a product with quantity modifiers
    await page.click('[data-testid="product-pizza"]')
    
    // Select modifier with quantity
    await page.click('[data-testid="modifier-extra-topping"]')
    
    // Should show quantity selector
    await expect(page.locator('[data-testid="modifier-quantity-selector"]')).toBeVisible()
    
    // Increase quantity
    await page.click('[data-testid="modifier-quantity-increment"]')
    await page.click('[data-testid="modifier-quantity-increment"]')
    
    // Verify quantity
    await expect(page.locator('[data-testid="modifier-quantity"]')).toContainText('3')
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart shows modifier with quantity
    await expect(page.locator('[data-testid="cart-modifier-extra-topping"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-quantity"]')).toContainText('x3')
  })

  test('should handle required modifiers', async ({ page }) => {
    // Add a product with required modifiers
    await page.click('[data-testid="product-sandwich"]')
    
    // Should show required modifier indicator
    await expect(page.locator('[data-testid="required-modifier-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-bread-type"]')).toHaveClass('required')
    
    // Try to confirm without selecting required modifier
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Should show validation error
    await expect(page.locator('[data-testid="required-modifier-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please select required modifiers')
    
    // Select required modifier
    await page.click('[data-testid="modifier-wheat-bread"]')
    
    // Should be able to confirm now
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify product is added to cart
    await expect(page.locator('[data-testid="cart-item-sandwich"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-wheat-bread"]')).toBeVisible()
  })

  test('should handle modifier conflicts', async ({ page }) => {
    // Add a product with conflicting modifiers
    await page.click('[data-testid="product-coffee"]')
    
    // Select conflicting modifier
    await page.click('[data-testid="modifier-whole-milk"]')
    
    // Try to select conflicting modifier
    await page.click('[data-testid="modifier-skim-milk"]')
    
    // Should show conflict warning
    await expect(page.locator('[data-testid="modifier-conflict-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="conflict-message"]')).toContainText('Cannot select both milk types')
    
    // Should automatically remove conflicting modifier
    await expect(page.locator('[data-testid="selected-modifier-whole-milk"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-skim-milk"]')).toBeVisible()
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart shows only selected modifier
    await expect(page.locator('[data-testid="cart-modifier-skim-milk"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-whole-milk"]')).not.toBeVisible()
  })

  test('should handle modifier limits', async ({ page }) => {
    // Add a product with modifier limits
    await page.click('[data-testid="product-salad"]')
    
    // Try to add more modifiers than allowed
    await page.click('[data-testid="modifier-tomato"]')
    await page.click('[data-testid="modifier-lettuce"]')
    await page.click('[data-testid="modifier-cucumber"]')
    await page.click('[data-testid="modifier-onion"]')
    await page.click('[data-testid="modifier-peppers"]')
    await page.click('[data-testid="modifier-olives"]')
    
    // Should show limit warning
    await expect(page.locator('[data-testid="modifier-limit-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="limit-message"]')).toContainText('Maximum 5 modifiers allowed')
    
    // Should disable additional modifiers
    await expect(page.locator('[data-testid="modifier-mushrooms"]')).toBeDisabled()
    
    // Remove one modifier to allow another
    await page.click('[data-testid="selected-modifier-tomato"]')
    
    // Should enable additional modifiers
    await expect(page.locator('[data-testid="modifier-mushrooms"]')).not.toBeDisabled()
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart shows selected modifiers
    await expect(page.locator('[data-testid="cart-modifiers"]')).toHaveCount(5)
  })

  test('should edit modifiers for existing cart item', async ({ page }) => {
    // Add product with initial modifiers
    await page.click('[data-testid="product-burger"]')
    await page.click('[data-testid="modifier-cheese"]')
    await page.click('[data-testid="modifier-bacon"]')
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Edit modifiers for the cart item
    await page.click('[data-testid="cart-item-burger"]')
    await page.click('[data-testid="edit-modifiers"]')
    
    // Should show current modifiers
    await expect(page.locator('[data-testid="selected-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-bacon"]')).toBeVisible()
    
    // Remove existing modifier
    await page.click('[data-testid="selected-modifier-bacon"]')
    
    // Add new modifier
    await page.click('[data-testid="modifier-lettuce"]')
    
    // Confirm changes
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart reflects changes
    await expect(page.locator('[data-testid="cart-modifier-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-bacon"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-lettuce"]')).toBeVisible()
    
    // Verify price updated
    const oldPrice = 12.99 + 1.50 + 2.00 // base + cheese + bacon
    const newPrice = 12.99 + 1.50 + 0.50 // base + cheese + lettuce
    
    const cartTotal = await page.locator('[data-testid="cart-total"]').textContent()
    expect(cartTotal).toContain(newPrice.toFixed(2))
  })

  test('should handle modifier pricing correctly', async ({ page }) => {
    // Add product with different modifier pricing
    await page.click('[data-testid="product-burger"]')
    
    // Add free modifier
    await page.click('[data-testid="modifier-pickles"]')
    
    // Add paid modifier
    await page.click('[data-testid="modifier-cheese"]')
    
    // Add premium modifier
    await page.click('[data-testid="modifier-truffle"]')
    
    // Verify pricing display
    await expect(page.locator('[data-testid="modifier-price-pickles"]')).toContainText('Free')
    await expect(page.locator('[data-testid="modifier-price-cheese"]')).toContainText('$1.50')
    await expect(page.locator('[data-testid="modifier-price-truffle"]')).toContainText('$5.00')
    
    // Verify total price calculation
    await expect(page.locator('[data-testid="modifier-total-price"]')).toContainText('$6.50')
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart total includes modifier prices
    const basePrice = 12.99
    const modifierTotal = 0 + 1.50 + 5.00
    const expectedTotal = basePrice + modifierTotal
    
    const cartTotal = await page.locator('[data-testid="cart-total"]').textContent()
    expect(cartTotal).toContain(expectedTotal.toFixed(2))
  })

  test('should handle modifier groups', async ({ page }) => {
    // Add product with modifier groups
    await page.click('[data-testid="product-pizza"]')
    
    // Should show modifier groups
    await expect(page.locator('[data-testid="modifier-group-sauce"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-group-topping"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-group-cheese"]')).toBeVisible()
    
    // Select from sauce group (single selection)
    await page.click('[data-testid="modifier-tomato-sauce"]')
    
    // Try to select another sauce
    await page.click('[data-testid="modifier-barbecue-sauce"]')
    
    // Should replace previous selection
    await expect(page.locator('[data-testid="selected-modifier-tomato-sauce"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-barbecue-sauce"]')).toBeVisible()
    
    // Select from topping group (multiple selection)
    await page.click('[data-testid="modifier-pepperoni"]')
    await page.click('[data-testid="modifier-mushrooms"]')
    
    // Should allow multiple selections
    await expect(page.locator('[data-testid="selected-modifier-pepperoni"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-modifier-mushrooms"]')).toBeVisible()
    
    // Confirm modifiers
    await page.click('[data-testid="confirm-modifiers"]')
    
    // Verify cart shows all selected modifiers
    await expect(page.locator('[data-testid="cart-modifier-barbecue-sauce"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-pepperoni"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-modifier-mushrooms"]')).toBeVisible()
  })

  test('should handle modifier search and filtering', async ({ page }) => {
    // Add product with many modifiers
    await page.click('[data-testid="product-custom-sandwich"]')
    
    // Should show search input for modifiers
    await expect(page.locator('[data-testid="modifier-search-input"]')).toBeVisible()
    
    // Search for specific modifier
    await page.fill('[data-testid="modifier-search-input"]', 'cheese')
    
    // Should filter modifiers
    await expect(page.locator('[data-testid="modifier-cheddar-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-mozzarella-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-tomato"]')).not.toBeVisible()
    
    // Clear search
    await page.click('[data-testid="clear-modifier-search"]')
    
    // Should show all modifiers again
    await expect(page.locator('[data-testid="modifier-tomato"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-cheddar-cheese"]')).toBeVisible()
    
    // Filter by category
    await page.click('[data-testid="modifier-category-filter"]')
    await page.click('[data-testid="modifier-category-cheese"]')
    
    // Should show only cheese modifiers
    await expect(page.locator('[data-testid="modifier-cheddar-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-mozzarella-cheese"]')).toBeVisible()
    await expect(page.locator('[data-testid="modifier-tomato"]')).not.toBeVisible()
  })
})
