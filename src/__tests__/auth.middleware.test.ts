import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  requireRole,
  optionalAuth,
  generateToken,
  verifyToken,
  refreshToken,
  createAuthMiddleware,
  AuthRequest,
} from '../middleware/auth.middleware';
import { config } from '../config/config';

// Mock jwt
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        organizationId: 'org-123',
      };

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockJwt.verify.mockReturnValue(mockUser as any);

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with required role', () => {
      mockReq.user = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        organizationId: 'org-123',
      };

      const middleware = requireRole(['admin', 'super_admin']);
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      mockReq.user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        organizationId: 'org-123',
      };

      const middleware = requireRole(['admin']);
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated user', () => {
      const middleware = requireRole(['admin']);
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate valid token', () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        organizationId: 'org-123',
      };

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockJwt.verify.mockReturnValue(mockUser as any);

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without token', () => {
      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue with invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate token with payload', () => {
      const payload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        organizationId: 'org-123',
      };

      mockJwt.sign.mockReturnValue('generated-token' as any);

      const token = generateToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });
      expect(token).toBe('generated-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockPayload = { id: 'user-123', email: 'user@example.com' };
      mockJwt.verify.mockReturnValue(mockPayload as any);

      const result = verifyToken('valid-token');

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', () => {
      const mockPayload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        organizationId: 'org-123',
        exp: 1234567890,
        iat: 1234567800,
      };

      mockJwt.verify.mockReturnValue(mockPayload as any);
      mockJwt.sign.mockReturnValue('new-token' as any);

      const newToken = refreshToken('old-token');

      expect(mockJwt.verify).toHaveBeenCalledWith('old-token', config.jwt.secret, {
        ignoreExpiration: true,
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: 'user-123',
          email: 'user@example.com',
          role: 'user',
          organizationId: 'org-123',
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      expect(newToken).toBe('new-token');
    });
  });

  describe('createAuthMiddleware', () => {
    it('should create middleware with custom options', () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        organizationId: 'org-123',
      };

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockReq.user = mockUser;
      mockJwt.verify.mockReturnValue(mockUser as any);

      const middleware = createAuthMiddleware({
        required: true,
        roles: ['admin'],
        requireOrganization: true,
      });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle optional authentication', () => {
      const middleware = createAuthMiddleware({ required: false });

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});