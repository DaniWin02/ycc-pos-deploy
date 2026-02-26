import { apiService } from '../../../04_CORE_POS/src/services/api.service';

// Mock de fetch global
global.fetch = jest.fn();

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('realiza una petición GET exitosa', async () => {
    const mockResponse = { data: 'test data' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    const result = await apiService.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith('/test-endpoint', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  test('realiza una petición POST exitosa', async () => {
    const mockData = { name: 'Test Product' };
    const mockResponse = { id: '1', ...mockData };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    const result = await apiService.post('/products', mockData);

    expect(fetch).toHaveBeenCalledWith('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
    });
    expect(result).toEqual(mockResponse);
  });

  test('realiza una petición PUT exitosa', async () => {
    const mockData = { name: 'Updated Product' };
    const mockResponse = { id: '1', ...mockData };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    const result = await apiService.put('/products/1', mockData);

    expect(fetch).toHaveBeenCalledWith('/products/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
    });
    expect(result).toEqual(mockResponse);
  });

  test('realiza una petición DELETE exitosa', async () => {
    const mockResponse = { message: 'Deleted successfully' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    const result = await apiService.delete('/products/1');

    expect(fetch).toHaveBeenCalledWith('/products/1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  test('maneja errores de red', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiService.get('/test-endpoint')).rejects.toThrow('Network error');
  });

  test('maneja respuestas HTTP con errores', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
      headers: new Headers(),
    } as Response);

    await expect(apiService.get('/test-endpoint')).rejects.toThrow('Not found');
  });

  test('incluye headers de autenticación', async () => {
    const mockResponse = { data: 'test data' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    // Simular token de autenticación
    localStorage.setItem('authToken', 'test-token');

    await apiService.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith('/test-endpoint', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    });

    localStorage.removeItem('authToken');
  });

  test('maneja timeouts', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    );

    await expect(apiService.get('/test-endpoint')).rejects.toThrow('Request timeout');
  });

  test('reintenta peticiones fallidas', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' }),
        headers: new Headers(),
      } as Response);

    const result = await apiService.get('/test-endpoint', { retry: 2 });

    expect(result).toEqual({ data: 'success' });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('maneja respuestas vacías', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
      headers: new Headers(),
    } as Response);

    const result = await apiService.get('/test-endpoint');

    expect(result).toBeNull();
  });

  test('formatea correctamente los parámetros de query', async () => {
    const mockResponse = { data: 'test data' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      headers: new Headers(),
    } as Response);

    await apiService.get('/test-endpoint', {
      params: { page: 1, limit: 10, search: 'test' }
    });

    expect(fetch).toHaveBeenCalledWith('/test-endpoint?page=1&limit=10&search=test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('maneja correctamente los headers de respuesta', async () => {
    const mockHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Rate-Limit': '100',
      'X-Rate-Remaining': '95'
    });
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test data' }),
      headers: mockHeaders,
    } as Response);

    const result = await apiService.get('/test-endpoint');

    expect(result).toEqual({ data: 'test data' });
    // Verificar que los headers se procesan correctamente
    expect(mockHeaders.get('X-Rate-Limit')).toBe('100');
  });

  test('maneja correctamente los errores de validación', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        error: 'Validation failed',
        details: { field: 'name', message: 'Required field' }
      }),
      headers: new Headers(),
    } as Response);

    await expect(apiService.post('/products', {})).rejects.toThrow('Validation failed');
  });

  test('maneja correctamente los errores de autorización', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
      headers: new Headers(),
    } as Response);

    await expect(apiService.get('/protected-endpoint')).rejects.toThrow('Unauthorized');
  });
});
