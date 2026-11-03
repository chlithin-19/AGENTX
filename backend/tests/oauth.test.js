import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAuthUrl,
  exchangeCode,
  isConfigured,
  OAUTH_CONFIG,
  getCallbackUri,
  _setMockState,
  _clearMockState
} from '../oauth.js'

describe('Google OAuth Integration End-to-End Hardening', () => {
  describe('1. Local Callback URI Generation', () => {
    it('generates exact local callback URIs without atlas.oqens.me dependency', () => {
      const googleCb = getCallbackUri('google')
      const gmailCb = getCallbackUri('gmail')
      const calCb = getCallbackUri('calendar')

      assert.ok(!googleCb.includes('atlas.oqens.me'), 'Must not reference atlas.oqens.me')
      assert.ok(!gmailCb.includes('atlas.oqens.me'), 'Must not reference atlas.oqens.me')
      assert.ok(!calCb.includes('atlas.oqens.me'), 'Must not reference atlas.oqens.me')

      assert.equal(googleCb, 'http://localhost:8080/api/oauth/google/callback')
      assert.equal(gmailCb, 'http://localhost:8080/api/oauth/gmail/callback')
      assert.equal(calCb, 'http://localhost:8080/api/oauth/calendar/callback')
    })
  })

  describe('2. Scope Configuration & Least-Privilege Verification', () => {
    it('configures Google Login scope for OpenID Connect authentication', () => {
      const scope = OAUTH_CONFIG.google.scope
      assert.ok(scope.includes('openid'), 'Must include openid')
      assert.ok(scope.includes('email'), 'Must include email')
      assert.ok(scope.includes('profile'), 'Must include profile')
    })

    it('configures standalone Gmail scope for email management', () => {
      assert.equal(OAUTH_CONFIG.gmail.scope, 'https://www.googleapis.com/auth/gmail.modify')
    })

    it('configures standalone Calendar scope for event management', () => {
      assert.equal(OAUTH_CONFIG.calendar.scope, 'https://www.googleapis.com/auth/calendar.events')
    })
  })

  describe('3. Missing OAuth Credentials Handling', () => {
    it('returns null from buildAuthUrl when credentials are not configured', () => {
      const origId = process.env.GOOGLE_CLIENT_ID
      const origSecret = process.env.GOOGLE_CLIENT_SECRET
      try {
        delete process.env.GOOGLE_CLIENT_ID
        delete process.env.GOOGLE_CLIENT_SECRET
        assert.equal(isConfigured('google'), false)
        assert.equal(buildAuthUrl('google'), null)
      } finally {
        process.env.GOOGLE_CLIENT_ID = origId
        process.env.GOOGLE_CLIENT_SECRET = origSecret
      }
    })
  })

  describe('4. CSRF State Protection & Validation', () => {
    it('rejects exchangeCode when state is unknown or missing', async () => {
      await assert.rejects(
        async () => {
          await exchangeCode('google', 'mock_auth_code', 'non_existent_state')
        },
        /invalid state/
      )
    })

    it('rejects exchangeCode when integration ID does not match state binding', async () => {
      const authUrl = buildAuthUrl('google')
      if (authUrl) {
        const u = new URL(authUrl)
        const state = u.searchParams.get('state')
        assert.ok(state, 'Must generate state parameter')

        // Attempt to exchange with wrong integration id ('gmail' instead of 'google')
        await assert.rejects(
          async () => {
            await exchangeCode('gmail', 'mock_auth_code', state)
          },
          /invalid state/
        )
      }
    })
  })

  describe('5. Authorization URL Construction', () => {
    it('constructs correct Google OAuth URL with offline access and local redirect', () => {
      if (isConfigured('google')) {
        const urlStr = buildAuthUrl('google', { returnTo: 'http://localhost:5173' })
        assert.ok(urlStr, 'Auth URL must be generated')
        const u = new URL(urlStr)
        assert.equal(u.origin, 'https://accounts.google.com')
        assert.equal(u.pathname, '/o/oauth2/v2/auth')
        assert.equal(u.searchParams.get('redirect_uri'), 'http://localhost:8080/api/oauth/google/callback')
        assert.equal(u.searchParams.get('access_type'), 'offline')
        assert.equal(u.searchParams.get('prompt'), 'consent')
        assert.equal(u.searchParams.get('response_type'), 'code')
        assert.ok(u.searchParams.get('state'), 'Must have cryptographic state')
      }
    })
  })

  describe('6. Callback Error Handling & Mocked Code Exchange', () => {
    it('successfully exchanges authorization code with mock provider and decodes id_token', async () => {
      const mockState = 'test_state_nonce_12345'
      _setMockState(mockState, {
        id: 'google',
        created: Date.now(),
        returnTo: 'http://localhost:5173'
      })

      // Simulated authentic Google JWT id_token payload
      const mockHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
      const mockPayload = Buffer.from(JSON.stringify({
        sub: '1098234710293847',
        email: 'alex.kumar@campus.edu',
        name: 'Alex Kumar',
        picture: 'https://lh3.googleusercontent.com/a/mock_avatar'
      })).toString('base64url')
      const mockIdToken = `${mockHeader}.${mockPayload}.mock_signature`

      const customFetcher = async () => ({
        ok: true,
        json: async () => ({
          access_token: 'ya29.mock_access_token_xyz',
          refresh_token: '1//mock_refresh_token_abc',
          expires_in: 3599,
          scope: 'openid email profile',
          id_token: mockIdToken
        })
      })

      const res = await exchangeCode('google', 'valid_mock_code', mockState, customFetcher)
      assert.equal(res.access_token, 'ya29.mock_access_token_xyz')
      assert.equal(res.refresh_token, '1//mock_refresh_token_abc')
      assert.equal(res.returnTo, 'http://localhost:5173')
      assert.ok(res.userInfo, 'userInfo must be populated')
      assert.equal(res.userInfo.email, 'alex.kumar@campus.edu')
      assert.equal(res.userInfo.name, 'Alex Kumar')
    })

    it('handles Google provider error responses gracefully', async () => {
      const mockState = 'error_state_nonce_67890'
      _setMockState(mockState, {
        id: 'google',
        created: Date.now(),
        returnTo: 'http://localhost:5173'
      })

      const customErrorFetcher = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Bad Request: Code has expired or has already been used'
        })
      })

      await assert.rejects(
        async () => {
          await exchangeCode('google', 'expired_code', mockState, customErrorFetcher)
        },
        /Bad Request: Code has expired/
      )
    })
  })

  describe('7. API Route Endpoints Verification', () => {
    it('verifies /api/oauth/google initiation returns valid url in JSON mode', async () => {
      if (isConfigured('google')) {
        const res = await fetch('http://localhost:8080/api/oauth/google?json=1')
        assert.equal(res.status, 200)
        const data = await res.json()
        assert.equal(data.ok, true)
        assert.equal(data.id, 'google')
        assert.ok(data.url.startsWith('https://accounts.google.com/o/oauth2/v2/auth'))
      }
    })

    it('verifies /api/integrations/google/connect initiation matches /api/oauth/google', async () => {
      if (isConfigured('google')) {
        const res = await fetch('http://localhost:8080/api/integrations/google/connect?json=1')
        assert.equal(res.status, 200)
        const data = await res.json()
        assert.equal(data.ok, true)
        assert.equal(data.id, 'google')
        assert.ok(data.url.includes('redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth%2Fgoogle%2Fcallback'))
      }
    })
  })
})
