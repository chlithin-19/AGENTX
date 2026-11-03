import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthUrl, exchangeCode, isConfigured, OAUTH_CONFIG, getCallbackUri } from '../oauth.js'

describe('Local OAuth Integration & Configuration Hardening', () => {
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
    it('configures master Google Workspace scope to cover identity, Gmail, and Calendar', () => {
      const scope = OAUTH_CONFIG.google.scope
      assert.ok(scope.includes('openid'), 'Must include openid')
      assert.ok(scope.includes('email'), 'Must include email')
      assert.ok(scope.includes('profile'), 'Must include profile')
      assert.ok(scope.includes('https://www.googleapis.com/auth/gmail.modify'), 'Must include gmail.modify')
      assert.ok(scope.includes('https://www.googleapis.com/auth/calendar.events'), 'Must include calendar.events')
    })

    it('configures standalone Gmail scope for email management', () => {
      assert.equal(OAUTH_CONFIG.gmail.scope, 'https://www.googleapis.com/auth/gmail.modify')
    })

    it('configures standalone Calendar scope for event management', () => {
      assert.equal(OAUTH_CONFIG.calendar.scope, 'https://www.googleapis.com/auth/calendar.events')
    })
  })

  describe('3. CSRF State Protection & Validation', () => {
    it('rejects exchangeCode when state is unknown or missing', async () => {
      await assert.rejects(
        async () => {
          await exchangeCode('google', 'mock_auth_code', 'non_existent_state')
        },
        /invalid state/
      )
    })

    it('rejects exchangeCode when integration ID does not match state binding', async () => {
      // Build auth URL for google to generate valid state
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

  describe('4. Authorization URL Construction', () => {
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
})
