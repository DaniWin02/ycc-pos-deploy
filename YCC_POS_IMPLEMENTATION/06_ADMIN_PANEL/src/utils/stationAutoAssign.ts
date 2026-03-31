/**
 * Utilitario para asignación automática de estaciones basada en categoría o nombre de producto
 */

export interface Station {
  id: string;
  name: string;
  displayName: string;
  color?: string;
  isActive: boolean;
}

/**
 * Detecta la estación apropiada basada en la categoría y/o nombre del producto
 */
export const detectStation = (
  categoryName: string,
  productName: string,
  stations: Station[]
): string | null => {
  const normalizedCategory = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedProduct = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Reglas de asignación por categoría
  const categoryRules: Record<string, string[]> = {
    'bebidas': ['bar'],
    'refrescos': ['bar'],
    'jugos': ['bar'],
    'aguas': ['bar'],
    'cocteles': ['bar'],
    'vinos': ['bar'],
    'licores': ['bar'],
    
    'carnes': ['parrilla'],
    'parrilla': ['parrilla'],
    'asados': ['parrilla'],
    'hamburguesas': ['parrilla'],
    'hot dogs': ['parrilla'],
    'cortes': ['parrilla'],
    
    'ensaladas': ['cocina-fria'],
    'frios': ['cocina-fria'],
    'sushi': ['cocina-fria'],
    'crudos': ['cocina-fria'],
    'tapas': ['cocina-fria'],
    
    'postres': ['postres'],
    'reposteria': ['postres'],
    'pasteles': ['postres'],
    'helados': ['postres'],
    'dulces': ['postres'],
    
    'sopas': ['cocina-caliente'],
    'pastas': ['cocina-caliente'],
    'platillos': ['cocina-caliente'],
    'comidas': ['cocina-caliente'],
    'caldos': ['cocina-caliente']
  };

  // Reglas de asignación por nombre de producto (palabras clave)
  const productRules: Record<string, string[]> = {
    'coca': ['bar'],
    'pepsi': ['bar'],
    'refresco': ['bar'],
    'agua': ['bar'],
    'jugo': ['bar'],
    'cerveza': ['bar'],
    'vino': ['bar'],
    'coctel': ['bar'],
    'margarita': ['bar'],
    
    'hamburguesa': ['parrilla'],
    'burger': ['parrilla'],
    'hot dog': ['parrilla'],
    'salchicha': ['parrilla'],
    'corte': ['parrilla'],
    'arrachera': ['parrilla'],
    'rib eye': ['parrilla'],
    'new york': ['parrilla'],
    'filete': ['parrilla'],
    'pollo': ['parrilla', 'cocina-caliente'],
    'alitas': ['parrilla'],
    'costilla': ['parrilla'],
    
    'ensalada': ['cocina-fria'],
    'cesar': ['cocina-fria'],
    'griega': ['cocina-fria'],
    'sushi': ['cocina-fria'],
    'roll': ['cocina-fria'],
    'nigiri': ['cocina-fria'],
    'sashimi': ['cocina-fria'],
    'tartar': ['cocina-fria'],
    'carpaccio': ['cocina-fria'],
    'ceviche': ['cocina-fria'],
    
    'pastel': ['postres'],
    'tarta': ['postres'],
    'flan': ['postres'],
    'mousse': ['postres'],
    'cheesecake': ['postres'],
    'brownie': ['postres'],
    'helado': ['postres'],
    'gelato': ['postres'],
    'sorbete': ['postres'],
    'pay': ['postres'],
    'pie': ['postres'],
    
    'sopa': ['cocina-caliente'],
    'pasta': ['cocina-caliente'],
    'spaghetti': ['cocina-caliente'],
    'fettuccine': ['cocina-caliente'],
    'lasagna': ['cocina-caliente'],
    'risotto': ['cocina-caliente'],
    'taco': ['cocina-caliente'],
    'burrito': ['cocina-caliente'],
    'enchilada': ['cocina-caliente'],
    'quesadilla': ['cocina-caliente'],
    'chile': ['cocina-caliente'],
    'mole': ['cocina-caliente']
  };

  // Buscar coincidencia por categoría primero
  for (const [key, stationNames] of Object.entries(categoryRules)) {
    if (normalizedCategory.includes(key)) {
      // Encontrar la primera estación que coincida
      for (const stationName of stationNames) {
        const station = stations.find(s => s.name === stationName);
        if (station) return station.id;
      }
    }
  }

  // Si no hay coincidencia por categoría, buscar por nombre de producto
  for (const [key, stationNames] of Object.entries(productRules)) {
    if (normalizedProduct.includes(key)) {
      for (const stationName of stationNames) {
        const station = stations.find(s => s.name === stationName);
        if (station) return station.id;
      }
    }
  }

  // Si no se encontró ninguna coincidencia, retornar null
  return null;
};

/**
 * Obtiene el nombre de la estación sugerida para mostrar al usuario
 */
export const getSuggestedStationName = (
  categoryName: string,
  productName: string
): string | null => {
  const normalizedCategory = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedProduct = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mapeo de nombres amigables
  const categoryMap: Record<string, string> = {
    'bebidas': 'Bar',
    'refrescos': 'Bar',
    'jugos': 'Bar',
    'cocteles': 'Bar',
    
    'carnes': 'Parrilla',
    'parrilla': 'Parrilla',
    'hamburguesas': 'Parrilla',
    
    'ensaladas': 'Cocina Fría',
    'frios': 'Cocina Fría',
    'sushi': 'Cocina Fría',
    
    'postres': 'Postres',
    'reposteria': 'Postres',
    
    'sopas': 'Cocina Caliente',
    'pastas': 'Cocina Caliente',
    'platillos': 'Cocina Caliente'
  };

  const productMap: Record<string, string> = {
    'coca': 'Bar',
    'pepsi': 'Bar',
    'cerveza': 'Bar',
    'hamburguesa': 'Parrilla',
    'ensalada': 'Cocina Fría',
    'sushi': 'Cocina Fría',
    'pastel': 'Postres',
    'sopa': 'Cocina Caliente'
  };

  // Buscar por categoría primero
  for (const [key, name] of Object.entries(categoryMap)) {
    if (normalizedCategory.includes(key)) return name;
  }

  // Buscar por producto
  for (const [key, name] of Object.entries(productMap)) {
    if (normalizedProduct.includes(key)) return name;
  }

  return null;
};
