import { store } from '../state/store';
import { sound } from '../engine/audio';

export class UIManager {
  public static showToast(message: string) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 2400);
  }

  public static renderTopBar() {
    const container = document.getElementById('top-bar-container');
    if (!container) return;

    const state = store.getState();
    container.innerHTML = `
      <div class="top-bar glass-panel">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00f0ff, #ffd600); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #000;">
            ${state.accountLevel}
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #00f0ff;">${state.username}</div>
            <div style="font-size: 10px; color: var(--text-muted);">Score: ${state.currentSeasonScore.toLocaleString()} pts</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <div class="currency-pill" title="Crystals (Main Upgrade Currency)">
            <span>💎</span>
            <span style="color: #00f0ff;">${state.crystals.toLocaleString()}</span>
          </div>
          <div class="currency-pill" title="Dark Shards (Rare Crafting Material)">
            <span>🌌</span>
            <span style="color: #c084fc;">${state.voidShards.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  public static renderNavigation() {
    const container = document.getElementById('nav-container');
    if (!container) return;

    const state = store.getState();
    if (state.screen === 'RIFT_COMBAT' || state.screen === 'TUTORIAL') {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="nav-tab-bar glass-panel">
        <button class="nav-btn ${state.screen === 'CITADEL' ? 'active' : ''}" id="nav-home">
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button class="nav-btn ${state.screen === 'HERO_ROSTER' ? 'active' : ''}" id="nav-heroes">
          <span>🦸</span>
          <span>Heroes</span>
        </button>
        <button class="nav-btn ${state.screen === 'ARMORY' ? 'active' : ''}" id="nav-gear">
          <span>⚔️</span>
          <span>Gear</span>
        </button>
        <button class="nav-btn ${state.screen === 'WORLD_MAP' ? 'active' : ''}" id="nav-world">
          <span>🌍</span>
          <span>World</span>
        </button>
        <button class="nav-btn ${state.screen === 'LEADERBOARD' ? 'active' : ''}" id="nav-ranks">
          <span>🏆</span>
          <span>Ranks</span>
        </button>
        <button class="nav-btn ${state.screen === 'GUILD' ? 'active' : ''}" id="nav-guild">
          <span>🛡️</span>
          <span>Guild</span>
        </button>
      </div>
    `;

    document.getElementById('nav-home')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'CITADEL' }); });
    document.getElementById('nav-heroes')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'HERO_ROSTER' }); });
    document.getElementById('nav-gear')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'ARMORY' }); });
    document.getElementById('nav-world')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'WORLD_MAP' }); });
    document.getElementById('nav-ranks')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'LEADERBOARD' }); });
    document.getElementById('nav-guild')?.addEventListener('click', () => { sound.playButtonClick(); store.setState({ screen: 'GUILD' }); });
  }
}
