import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, ChevronRight, MessageSquare } from 'lucide-react';
import { Product, ProductVariant, SelectedModifier, ModifierGroup } from '../types';

interface ProductCustomizationModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, variantId?: string, variantName?: string, variantPrice?: number, modifiers?: SelectedModifier[], notes?: string) => void;
  fmt: (n: number) => string;
}

export function ProductCustomizationModal({ product, onClose, onAdd, fmt }: ProductCustomizationModalProps) {
  const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
  const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;

  // Step 1: Select variant (if applicable)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? null : null // Always start null, user must select
  );
  // Step 2: Select modifiers
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  // Notes
  const [customNotes, setCustomNotes] = useState('');
  // Current step
  const [step, setStep] = useState<'variant' | 'modifiers' | 'notes'>(hasVariants ? 'variant' : hasModifiers ? 'modifiers' : 'notes');

  // Calculate total price
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.priceAdd, 0);
  const totalPrice = basePrice + modifiersTotal;

  // Toggle a modifier selection
  const toggleModifier = (group: ModifierGroup, modifierId: string, modifierName: string, priceAdd: number) => {
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.modifierId === modifierId);
      if (exists) {
        return prev.filter(m => m.modifierId !== modifierId);
      }
      return [...prev, { groupId: group.id, groupName: group.name, modifierId, modifierName, priceAdd }];
    });
  };

  // Check if a modifier is selected
  const isModifierSelected = (modifierId: string) => {
    return selectedModifiers.some(m => m.modifierId === modifierId);
  };

  // Handle add to cart
  const handleConfirm = () => {
    const variantId = selectedVariant?.id;
    const variantName = selectedVariant?.name;
    const variantPrice = selectedVariant?.price;
    const modifiers = selectedModifiers.length > 0 ? selectedModifiers : undefined;
    const notes = customNotes.trim() || undefined;
    onAdd(product, variantId, variantName, variantPrice, modifiers, notes);
  };

  // Can proceed to next step?
  const canProceed = () => {
    if (step === 'variant' && hasVariants && !selectedVariant) return false;
    return true;
  };

  // Go to next step
  const goNext = () => {
    if (step === 'variant') {
      setStep(hasModifiers ? 'modifiers' : 'notes');
    } else if (step === 'modifiers') {
      setStep('notes');
    }
  };

  // Go back
  const goBack = () => {
    if (step === 'notes') {
      setStep(hasModifiers ? 'modifiers' : hasVariants ? 'variant' : 'modifiers');
    } else if (step === 'modifiers') {
      if (hasVariants) setStep('variant');
    }
  };

  const showBackButton = (step === 'modifiers' && hasVariants) || (step === 'notes' && (hasVariants || hasModifiers));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">{product.name}</h3>
            <p className="text-blue-100 text-sm">
              {step === 'variant' && `Selecciona ${product.variantLabel || 'presentación'}`}
              {step === 'modifiers' && 'Personaliza tu pedido'}
              {step === 'notes' && 'Notas adicionales'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step indicators */}
        {(hasVariants || hasModifiers) && (
          <div className="flex items-center px-4 py-2 bg-gray-50 border-b">
            {hasVariants && (
              <button
                onClick={() => setStep('variant')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  step === 'variant' ? 'bg-blue-600 text-white' : selectedVariant ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {selectedVariant ? '✓' : '1'} {product.variantLabel || 'Presentación'}
              </button>
            )}
            {hasModifiers && (
              <button
                onClick={() => hasVariants && !selectedVariant ? null : setStep('modifiers')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ml-2 ${
                  step === 'modifiers' ? 'bg-blue-600 text-white' : selectedModifiers.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {selectedModifiers.length > 0 ? `✓ ${selectedModifiers.length}` : '2'} Modificadores
              </button>
            )}
            <button
              onClick={() => setStep('notes')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ml-2 ${
                step === 'notes' ? 'bg-blue-600 text-white' : customNotes ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {customNotes ? '✓' : hasVariants && hasModifiers ? '3' : hasVariants || hasModifiers ? '2' : '1'} Notas
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto">

          {/* STEP: Variant Selection */}
          {step === 'variant' && hasVariants && (
            <div className="p-4 space-y-2">
              {product.variants!.filter(v => v.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedVariant?.id === variant.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedVariant?.id === variant.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`font-bold text-base ${selectedVariant?.id === variant.id ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-700'}`}>
                        {variant.name}
                      </span>
                    </div>
                    {variant.description && (
                      <span className="text-xs text-gray-500 block mt-1 ml-7">{variant.description}</span>
                    )}
                    {variant.currentStock <= 0 && (
                      <span className="text-xs text-red-500 font-medium block mt-1 ml-7">Sin stock</span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-xl font-black text-emerald-600">{fmt(variant.price)}</span>
                    <span className="text-xs text-gray-400 ml-1">MXN</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP: Modifiers Selection */}
          {step === 'modifiers' && hasModifiers && (
            <div className="p-4 space-y-4">
              {product.modifierGroups!.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">{group.name}</h4>
                    {group.isRequired && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Obligatorio</span>
                    )}
                    {!group.isRequired && (
                      <span className="text-xs text-gray-400">Opcional</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-500 mb-2">{group.description}</p>
                  )}
                  <div className="space-y-1">
                    {group.modifiers.filter(m => m.isActive).map((modifier) => (
                      <button
                        key={modifier.id}
                        onClick={() => toggleModifier(group, modifier.id, modifier.name, modifier.priceAdd)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                          isModifierSelected(modifier.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isModifierSelected(modifier.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isModifierSelected(modifier.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className={`font-semibold text-sm ${isModifierSelected(modifier.id) ? 'text-blue-700' : 'text-gray-700'}`}>
                              {modifier.name}
                            </span>
                            {modifier.description && (
                              <span className="text-xs text-gray-400 block">{modifier.description}</span>
                            )}
                          </div>
                        </div>
                        {modifier.priceAdd > 0 ? (
                          <span className="text-sm font-bold text-emerald-600">+{fmt(modifier.priceAdd)}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Gratis</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP: Notes */}
          {step === 'notes' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Notas especiales
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, bien cocido, salsa aparte..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:border-blue-500 focus:outline-none transition-colors"
                  rows={3}
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-gray-700 text-sm">Resumen</h4>
                {selectedVariant && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{product.name} ({selectedVariant.name})</span>
                    <span className="font-semibold">{fmt(selectedVariant.price)}</span>
                  </div>
                )}
                {!selectedVariant && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{product.name}</span>
                    <span className="font-semibold">{fmt(product.price)}</span>
                  </div>
                )}
                {selectedModifiers.map((m, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">+ {m.modifierName}</span>
                    <span className="font-semibold text-emerald-600">{m.priceAdd > 0 ? `+${fmt(m.priceAdd)}` : 'Gratis'}</span>
                  </div>
                ))}
                {customNotes && (
                  <div className="text-xs text-gray-500 italic pt-1 border-t">
                    📝 {customNotes}
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-black text-emerald-600">{fmt(totalPrice)} <span className="text-xs text-gray-400">MXN</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex gap-2">
          {showBackButton && (
            <button
              onClick={goBack}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              ← Atrás
            </button>
          )}
          {step !== 'notes' ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar {fmt(totalPrice)}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
