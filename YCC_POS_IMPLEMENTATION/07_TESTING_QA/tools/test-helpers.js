// Helpers y utilidades para testing

// Helper para esperar a que un elemento aparezca
export const waitForElement = async (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
};

// Helper para esperar a que un elemento desaparezca
export const waitForElementToDisappear = async (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (!element) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} still visible after ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
};

// Helper para simular escritura en un input
export const simulateTyping = async (element, text, delay = 50) => {
  element.focus();
  element.value = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    element.value += char;
    
    // Disparar eventos
    element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
};

// Helper para simular clics múltiples
export const simulateMultipleClicks = async (element, count, delay = 100) => {
  for (let i = 0; i < count; i++) {
    element.click();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

// Helper para verificar accesibilidad
export const checkAccessibility = (container) => {
  const issues = [];
  
  // Verificar atributos ARIA
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
      issues.push({
        element: button,
        type: 'missing-aria-label',
        message: 'Button missing aria-label or text content'
      });
    }
  });
  
  // Verificar contraste de colores (básico)
  const textElements = container.querySelectorAll('*');
  textElements.forEach(element => {
    if (element.textContent.trim()) {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Verificación básica de contraste
      if (color === backgroundColor) {
        issues.push({
          element,
          type: 'low-contrast',
          message: 'Text color matches background color'
        });
      }
    }
  });
  
  // Verificar tabindex
  const focusableElements = container.querySelectorAll('button, input, select, textarea, a, [tabindex]');
  focusableElements.forEach(element => {
    const tabindex = element.getAttribute('tabindex');
    if (tabindex && parseInt(tabindex) < 0) {
      issues.push({
        element,
        type: 'invalid-tabindex',
        message: 'Element has negative tabindex'
      });
    }
  });
  
  return issues;
};

// Helper para verificar responsividad
export const checkResponsiveness = async (element, breakpoints) => {
  const results = {};
  
  for (const [name, width] of Object.entries(breakpoints)) {
    // Simular tamaño de pantalla
    window.innerWidth = width;
    window.innerHeight = 800;
    window.dispatchEvent(new Event('resize'));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar si el elemento es visible
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    
    results[name] = {
      width,
      isVisible,
      rect: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      }
    };
  }
  
  return results;
};

// Helper para medir rendimiento
export const measurePerformance = async (fn, iterations = 1) => {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await fn();
    const endTime = performance.now();
    
    results.push(endTime - startTime);
  }
  
  return {
    times: results,
    average: results.reduce((sum, time) => sum + time, 0) / results.length,
    min: Math.min(...results),
    max: Math.max(...results),
    median: results.sort((a, b) => a - b)[Math.floor(results.length / 2)]
  };
};

// Helper para simular eventos de arrastrar y soltar
export const simulateDragAndDrop = (source, target) => {
  // Iniciar arrastre
  source.dispatchEvent(new DragEvent('dragstart', {
    bubbles: true,
    dataTransfer: new DataTransfer()
  }));
  
  // Arrastrar sobre target
  target.dispatchEvent(new DragEvent('dragover', {
    bubbles: true,
    dataTransfer: new DataTransfer()
  }));
  
  // Soltar en target
  target.dispatchEvent(new DragEvent('drop', {
    bubbles: true,
    dataTransfer: new DataTransfer()
  }));
  
  // Finalizar arrastre
  source.dispatchEvent(new DragEvent('dragend', {
    bubbles: true,
    dataTransfer: new DataTransfer()
  }));
};

// Helper para verificar animaciones
export const checkAnimation = (element, expectedProperties) => {
  const computedStyle = window.getComputedStyle(element);
  const results = {};
  
  for (const property of expectedProperties) {
    const value = computedStyle.getPropertyValue(property);
    results[property] = {
      value,
      hasTransition: computedStyle.transition.includes(property),
      hasAnimation: computedStyle.animation.includes(property)
    };
  }
  
  return results;
};

// Helper para simular scroll
export const simulateScroll = (element, direction, distance) => {
  const startScrollTop = element.scrollTop;
  const startScrollLeft = element.scrollLeft;
  
  if (direction === 'vertical') {
    element.scrollTop = startScrollTop + distance;
  } else {
    element.scrollLeft = startScrollLeft + distance;
  }
  
  element.dispatchEvent(new Event('scroll', { bubbles: true }));
  
  return {
    scrollTop: element.scrollTop,
    scrollLeft: element.scrollLeft,
    deltaY: element.scrollTop - startScrollTop,
    deltaX: element.scrollLeft - startScrollLeft
  };
};

// Helper para verificar estado de focus
export const checkFocusManagement = (container) => {
  const focusableElements = container.querySelectorAll(
    'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
  );
  
  const results = {
    totalFocusable: focusableElements.length,
    hasTabIndex: [],
    missingTabIndex: [],
    focusOrder: []
  };
  
  focusableElements.forEach((element, index) => {
    const tabindex = element.getAttribute('tabindex');
    
    if (tabindex) {
      results.hasTabIndex.push({
        element,
        tabindex: parseInt(tabindex),
        index
      });
    } else {
      results.missingTabIndex.push({
        element,
        index
      });
    }
    
    results.focusOrder.push({
      element,
      tagName: element.tagName,
      type: element.type,
      index
    });
  });
  
  return results;
};

// Helper para simular eventos táctiles
export const simulateTouchEvent = (element, type, touches = []) => {
  const touchList = touches.map(touch => ({
    identifier: touch.id || 0,
    target: element,
    clientX: touch.x || 0,
    clientY: touch.y || 0,
    pageX: touch.x || 0,
    pageY: touch.y || 0,
    screenX: touch.x || 0,
    screenY: touch.y || 0
  }));
  
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touchList,
    targetTouches: touchList,
    changedTouches: touchList
  });
  
  element.dispatchEvent(event);
};

// Helper para verificar estado de carga
export const checkLoadingState = (element) => {
  const computedStyle = window.getComputedStyle(element);
  const hasLoadingClass = element.classList.contains('loading');
  const hasLoadingAttribute = element.getAttribute('aria-busy') === 'true';
  const hasSpinner = element.querySelector('[data-testid="loading-spinner"]') !== null;
  
  return {
    isLoading: hasLoadingClass || hasLoadingAttribute || hasSpinner,
    hasLoadingClass,
    hasLoadingAttribute,
    hasSpinner,
    opacity: computedStyle.opacity,
    pointerEvents: computedStyle.pointerEvents
  };
};

// Helper para limpiar el DOM después de tests
export const cleanupDOM = () => {
  // Limpiar timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  // Limpiar intervals
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
  
  // Limpiar event listeners
  document.removeEventListener = jest.fn();
  window.removeEventListener = jest.fn();
  
  // Limpiar DOM
  document.body.innerHTML = '';
};

// Helper para crear snapshots consistentes
export const createSnapshot = (element, options = {}) => {
  const {
    includeStyles = true,
    includeAttributes = ['data-testid', 'class', 'id'],
    excludeSelectors = []
  } = options;
  
  const clone = element.cloneNode(true);
  
  // Remover elementos excluidos
  excludeSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
  
  // Limpiar atributos
  const allElements = clone.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (!includeAttributes.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return clone.outerHTML;
};

// Helper para verificar estado de formulario
export const checkFormState = (form) => {
  const inputs = form.querySelectorAll('input, select, textarea');
  const buttons = form.querySelectorAll('button');
  
  const results = {
    isValid: form.checkValidity(),
    fields: [],
    buttons: []
  };
  
  inputs.forEach(input => {
    results.fields.push({
      name: input.name,
      type: input.type,
      value: input.value,
      isValid: input.checkValidity(),
      errorMessage: input.validationMessage,
      isRequired: input.hasAttribute('required'),
      isDisabled: input.hasAttribute('disabled')
    });
  });
  
  buttons.forEach(button => {
    results.buttons.push({
      type: button.type,
      text: button.textContent,
      isDisabled: button.hasAttribute('disabled'),
      isSubmit: button.type === 'submit'
    });
  });
  
  return results;
};
