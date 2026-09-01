/**
 * HTTP API Client with Dynamic URL & Standalone Offline Fallback
 */

import { store } from '../state/store';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  
  private static async request<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    const state = store.getState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        console.warn(`API request to ${path} failed with status:`, response.status);
        return null;
      }
      return await response.json();
    } catch (err) {
      // Graceful fallback to client-side local offline simulation on Netlify
      return null;
    }
  }

  public static async autoLoginGuest(): Promise<boolean> {
    const res = await this.request<{ access_token: string; user_id: string; username: string }>('/auth/guest', {
      method: 'POST'
    });

    if (res && res.access_token) {
      store.setState({
        token: res.access_token,
        userId: res.user_id,
        username: res.username
      });
      return true;
    }
    return false;
  }

  public static async startRiftRun(heroId: string, tier: number) {
    return await this.request<any>('/rift/start', {
      method: 'POST',
      body: JSON.stringify({ hero_id: heroId, rift_tier: tier })
    });
  }

  public static async completeFloor(sessionId: string, floorNum: number, metrics: any) {
    return await this.request<any>('/rift/floor/complete', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        floor_number: floorNum,
        combat_metrics: metrics
      })
    });
  }

  public static async extractRun(sessionId: string) {
    return await this.request<any>('/rift/extract', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
  }

  public static async upgradeWeapon(itemId: string) {
    return await this.request<any>('/forge/upgrade', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, upgrade_type: 'ENHANCE_TIER' })
    });
  }

  public static async getLeaderboards() {
    return await this.request<any[]>('/leaderboards/chrono-trials');
  }

  public static async getWorldState() {
    return await this.request<any>('/liveops/world-state');
  }

  public static async contributeToGuild(aetherAmount: number) {
    return await this.request<any>('/guild/contribute', {
      method: 'POST',
      body: JSON.stringify({ aether_amount: aetherAmount })
    });
  }
}
