import { store, HeroDefinition } from '../state/store';
import { ApiClient } from '../api/client';
import { UIManager } from './hud';
import { sound } from '../engine/audio';

export class MenuRenderer {

  private static tutorialStep: number = 1;

  public static renderCurrentScreen(onStartCombat: () => void) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const state = store.getState();
    container.innerHTML = '';

    // Show tutorial on first launch if not completed
    if (!state.hasCompletedTutorial && state.screen === 'CITADEL') {
      this.renderTutorial(container, onStartCombat);
      return;
    }

    switch (state.screen) {
      case 'TUTORIAL':
        this.renderTutorial(container, onStartCombat);
        break;
      case 'CITADEL':
        this.renderCitadel(container, onStartCombat);
        break;
      case 'ARMORY':
        this.renderArmory(container);
        break;
      case 'HERO_ROSTER':
        this.renderHeroRoster(container);
        break;
      case 'BATTLE_PASS':
        this.renderBattlePass(container);
        break;
      case 'WORLD_MAP':
        this.renderWorldMap(container);
        break;
      case 'LEADERBOARD':
        this.renderLeaderboard(container);
        break;
      case 'GUILD':
        this.renderGuild(container);
        break;
      case 'EXTRACTION_SUMMARY':
        this.renderExtractionSummary(container);
        break;
    }
  }

  public static renderTutorial(container: HTMLElement, onStartCombat: () => void) {
    container.innerHTML = ''; // Ensure container is clean
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';

    const slides = [
      {
        title: "🕹️ Step 1: Move & Aim",
        icon: "🏃‍♂️",
        headline: "Drag to move. Shooting is automatic!",
        details: "Drag anywhere on your screen (or use WASD on desktop) to move. Your hero automatically aims and fires elemental blasts at the nearest monster.",
        color: "#00f0ff"
      },
      {
        title: "🔥 Step 2: Combine Elements!",
        icon: "🌪️",
        headline: "Fire + Wind = Fire Tornado!",
        details: "Hit enemies with your weapon, then tap your Skill button. Combining elements triggers huge explosions like Fire Tornado 🔥, Super Shock ⚡, or Dark Blast 💥!",
        color: "#ff5500"
      },
      {
        title: "⚡ Step 3: Dodge Danger",
        icon: "🛡️",
        headline: "Red circles mean danger!",
        details: "When monsters attack, red danger zones will light up on the ground. Tap Dash to phase right through them with 100% invulnerability!",
        color: "#ffd600"
      },
      {
        title: "🚪 Step 4: Extract or Push Deeper!",
        icon: "💎",
        headline: "Safe Bank vs High Risk Loot",
        details: "When you defeat all monsters, step into the Green Portal to safely keep all your Crystals 💎, or step into the Purple Portal for 3x Bonus Loot!",
        color: "#10b981"
      }
    ];

    // Ensure step is in bounds
    if (this.tutorialStep < 1) this.tutorialStep = 1;
    if (this.tutorialStep > 4) this.tutorialStep = 4;

    const currentSlide = slides[this.tutorialStep - 1];

    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title" style="color: ${currentSlide.color};">${currentSlide.title}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: var(--text-muted); font-weight: bold;">${this.tutorialStep} of 4</span>
          <button class="btn-close" id="btn-close-tutorial" title="Skip Tutorial">✕</button>
        </div>
      </div>

      <div style="text-align: center; padding: 16px 0;">
        <div style="font-size: 56px; margin-bottom: 8px;">${currentSlide.icon}</div>
        <div style="font-size: 17px; font-weight: 800; color: #fff;">${currentSlide.headline}</div>
        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-top: 8px; padding: 0 10px;">
          ${currentSlide.details}
        </div>
      </div>

      <!-- Interactive Clickable Step Dots -->
      <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px;">
        ${slides.map((_, i) => `
          <button class="btn-tutorial-dot" data-step="${i + 1}" style="cursor: pointer; border: none; width: ${i + 1 === this.tutorialStep ? '28px' : '10px'}; height: 10px; border-radius: 5px; background: ${i + 1 === this.tutorialStep ? currentSlide.color : 'rgba(255,255,255,0.25)'}; transition: all 0.2s;"></button>
        `).join('')}
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 8px;">
          ${this.tutorialStep > 1 ? `
            <button class="btn-secondary" id="btn-prev-tutorial" style="flex: 1; padding: 12px; font-size: 13px; font-weight: bold;">
              ◀ PREV
            </button>
          ` : ''}
          ${this.tutorialStep < 4 ? `
            <button class="btn-primary" id="btn-next-tutorial" style="flex: 2; font-size: 14px; padding: 12px;">
              NEXT (STEP ${this.tutorialStep + 1}) ▶
            </button>
          ` : `
            <button class="btn-primary" id="btn-finish-tutorial" style="flex: 1; font-size: 15px; padding: 14px; background: linear-gradient(135deg, #10b981, #00f0ff);">
              🚀 PLAY NOW (+500 💎 BONUS!)
            </button>
          `}
        </div>

        <button class="btn-secondary" id="btn-skip-tutorial" style="padding: 10px; font-size: 12px; color: var(--text-muted); border-color: rgba(255,255,255,0.15);">
          Skip Tutorial & Go to Base
        </button>
      </div>
    `;

    container.appendChild(modal);

    // Next Button Event
    document.getElementById('btn-next-tutorial')?.addEventListener('click', () => {
      sound.playButtonClick();
      this.tutorialStep++;
      this.renderTutorial(container, onStartCombat);
    });

    // Prev Button Event
    document.getElementById('btn-prev-tutorial')?.addEventListener('click', () => {
      sound.playButtonClick();
      this.tutorialStep--;
      this.renderTutorial(container, onStartCombat);
    });

    // Clickable Dot Tabs
    document.querySelectorAll('.btn-tutorial-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const stepNum = parseInt((e.target as HTMLElement).getAttribute('data-step') || '1', 10);
        sound.playButtonClick();
        this.tutorialStep = stepNum;
        this.renderTutorial(container, onStartCombat);
      });
    });

    // Skip Tutorial Event
    const skipAction = () => {
      sound.playButtonClick();
      this.tutorialStep = 1;
      store.setState({ hasCompletedTutorial: true, screen: 'CITADEL' });
      UIManager.showToast('Welcome to the Base!');
    };

    document.getElementById('btn-skip-tutorial')?.addEventListener('click', skipAction);
    document.getElementById('btn-close-tutorial')?.addEventListener('click', skipAction);

    // Finish Tutorial Event
    document.getElementById('btn-finish-tutorial')?.addEventListener('click', () => {
      sound.playLevelUp();
      const state = store.getState();
      this.tutorialStep = 1;
      store.setState({
        hasCompletedTutorial: true,
        crystals: state.crystals + 500,
        screen: 'CITADEL'
      });
      UIManager.showToast('Tutorial Complete! +500 Bonus Crystals Awarded 💎');
      onStartCombat();
    });
  }

  private static renderCitadel(container: HTMLElement, onStartCombat: () => void) {
    const state = store.getState();
    const activeHero = state.heroes.find(h => h.id === state.activeHeroId) || state.heroes[0];

    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Command Base</div>
        <button class="btn-secondary" id="btn-reopen-tutorial" style="padding: 4px 8px; font-size: 11px;">
          📖 How to Play
        </button>
      </div>

      <!-- Daily Power Buff -->
      <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--border-glow); padding: 12px; border-radius: 10px;">
        <div style="font-size: 11px; color: var(--aether-cyan); font-weight: 800;">TODAY'S PLANET BUFF</div>
        <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">⚡ Thunder Surge Active</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">+20% Attack Speed & Double Crystal drops today!</div>
      </div>

      <!-- Active Hero Card with Quick Switch -->
      <div style="display: flex; gap: 12px; align-items: center; background: rgba(0, 0, 0, 0.35); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #00f0ff, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 28px;">
          ${activeHero.icon}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 15px; font-weight: 800; color: #fff;">${activeHero.name} • ${activeHero.title}</div>
          <div style="font-size: 12px; color: var(--aether-cyan);">${activeHero.primaryElement} + ${activeHero.secondaryElement} Element</div>
          <div style="font-size: 11px; color: var(--text-muted);">Weapon: ${state.equippedWeapon.name} (Tier ${state.equippedWeapon.tier})</div>
        </div>
        <button class="btn-secondary" id="btn-open-roster" style="padding: 6px 10px; font-size: 11px;">
          HEROES
        </button>
      </div>

      <!-- Quick Shortcuts -->
      <div style="display: flex; gap: 8px;">
        <button class="btn-secondary" id="btn-open-battlepass" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px;">
          <span>🎁</span> <span>Season Pass</span>
        </button>
        <button class="btn-secondary" id="btn-open-skills" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px;">
          <span>⚔️</span> <span>Forge & Skills</span>
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button class="btn-primary" id="btn-enter-rift" style="font-size: 17px; padding: 16px; letter-spacing: 0.5px;">
          ▶ PLAY BATTLE (FLOOR ${state.currentFloor})
        </button>
        <div style="text-align: center; font-size: 11px; color: var(--text-muted);">
          No energy timers • Play anytime • Pure skill & combos
        </div>
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-reopen-tutorial')?.addEventListener('click', () => {
      sound.playButtonClick();
      this.tutorialStep = 1;
      this.renderTutorial(container, onStartCombat);
    });

    document.getElementById('btn-enter-rift')?.addEventListener('click', () => {
      sound.playButtonClick();
      onStartCombat();
    });

    document.getElementById('btn-open-roster')?.addEventListener('click', () => {
      sound.playButtonClick();
      store.setState({ screen: 'HERO_ROSTER' });
    });

    document.getElementById('btn-open-battlepass')?.addEventListener('click', () => {
      sound.playButtonClick();
      store.setState({ screen: 'BATTLE_PASS' });
    });

    document.getElementById('btn-open-skills')?.addEventListener('click', () => {
      sound.playButtonClick();
      store.setState({ screen: 'ARMORY' });
    });
  }

  private static renderHeroRoster(container: HTMLElement) {
    const state = store.getState();
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Choose Your Hero</div>
        <button class="btn-close" id="btn-close-roster">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${state.heroes.map(hero => `
          <div style="display: flex; gap: 12px; align-items: center; background: ${hero.id === state.activeHeroId ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)'}; border: 1px solid ${hero.id === state.activeHeroId ? 'var(--aether-cyan)' : 'rgba(255,255,255,0.1)'}; padding: 12px; border-radius: 12px;">
            <div style="font-size: 34px; width: 48px; text-align: center;">${hero.icon}</div>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 800; color: #fff;">${hero.name} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${hero.title})</span></div>
              <div style="font-size: 11px; color: var(--aether-cyan); margin: 2px 0;">Elements: ${hero.primaryElement} + ${hero.secondaryElement}</div>
              <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${hero.description}</div>
              <div style="font-size: 10px; color: var(--volt-gold); margin-top: 4px;">Skills: 1. ${hero.skill1Name} | 2. ${hero.skill2Name}</div>
            </div>
            <div>
              ${hero.id === state.activeHeroId ? `
                <span style="font-size: 11px; font-weight: 800; color: var(--success-green); padding: 4px 8px; background: rgba(16,185,129,0.15); border-radius: 6px;">SELECTED</span>
              ` : `
                <button class="btn-primary btn-select-hero" data-hero-id="${hero.id}" style="padding: 6px 12px; font-size: 11px;">
                  CHOOSE
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-close-roster')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });

    document.querySelectorAll('.btn-select-hero').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const heroId = (e.target as HTMLElement).getAttribute('data-hero-id');
        if (heroId) {
          sound.playLevelUp();
          const chosen = state.heroes.find(h => h.id === heroId)!;
          store.setState({
            activeHeroId: heroId,
            equippedWeapon: {
              ...state.equippedWeapon,
              element: chosen.primaryElement
            }
          });
          UIManager.showToast(`Selected ${chosen.name}!`);
          this.renderHeroRoster(container);
        }
      });
    });
  }

  private static renderBattlePass(container: HTMLElement) {
    const state = store.getState();
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Season Rewards</div>
        <button class="btn-close" id="btn-close-bp">✕</button>
      </div>

      <div style="background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.15)); border: 1px solid var(--border-glow); padding: 14px; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; color: var(--aether-cyan); font-weight: 800;">SEASON 1 PASS</div>
            <div style="font-size: 16px; font-weight: 900; color: #fff;">Pass Level 3</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--volt-gold); font-weight: 800;">XP: 1,200 / 1,500</div>
            <div style="font-size: 10px; color: var(--text-muted);">60 Days Remaining</div>
          </div>
        </div>
        <div class="bar-container" style="height: 8px; margin-top: 8px;">
          <div class="hp-fill" style="width: 65%; background: linear-gradient(90deg, #00f0ff, #ffd600);"></div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; padding-right: 4px;">
        ${state.battlePassTiers.map(t => `
          <div style="display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;">
              ${t.tier}
            </div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; color: var(--aether-cyan);">Free: ${t.freeReward}</div>
              <div style="font-size: 11px; color: var(--void-purple);">Bonus: ${t.premiumReward}</div>
            </div>
            <div>
              <button class="btn-secondary btn-claim-tier" style="padding: 4px 10px; font-size: 10px;" ${t.tier <= 3 ? '' : 'disabled style="opacity:0.4"'}>
                ${t.tier <= 3 ? 'CLAIM' : 'LOCKED'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="font-size: 11px; color: var(--text-muted); text-align: center;">
        Free for everyone • Play battles to earn XP and claim rewards
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-close-bp')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });

    document.querySelectorAll('.btn-claim-tier').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playCrystalHarvest();
        UIManager.showToast('Claimed Free Season Reward!');
      });
    });
  }

  private static renderArmory(container: HTMLElement) {
    const state = store.getState();
    const wpn = state.equippedWeapon;
    const upgradeCost = wpn.tier * 250;
    const activeHero = state.heroes.find(h => h.id === state.activeHeroId) || state.heroes[0];
    const skills = state.skillPointsAllocated[activeHero.id] || { attack: 0, comboRadius: 0, health: 0 };

    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Gear & Skill Upgrades</div>
        <button class="btn-close" id="btn-close-modal">✕</button>
      </div>

      <!-- Weapon Section -->
      <div style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid var(--border-glow);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: var(--aether-cyan);">${wpn.name}</div>
            <div style="font-size: 11px; color: var(--pyro-orange); font-weight: 700;">TIER ${wpn.tier} • ${wpn.element} ELEMENT</div>
          </div>
          <div style="font-size: 32px;">🔥</div>
        </div>

        <div style="display: flex; justify-content: space-around; margin: 12px 0 8px 0;">
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">Damage</div>
            <div style="font-size: 16px; font-weight: 800; color: #fff;">${wpn.baseDamage}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">Attack Speed</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--volt-gold);">Fast</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">Crit Chance</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--cryo-frost);">25%</div>
          </div>
        </div>

        <button class="btn-primary" id="btn-upgrade-wpn" style="width: 100%; padding: 10px; font-size: 12px;" ${state.crystals < upgradeCost ? 'disabled style="opacity:0.5"' : ''}>
          ⚡ UPGRADE TO TIER ${wpn.tier + 1} (${upgradeCost} 💎)
        </button>
      </div>

      <!-- Hero Skill Points -->
      <div style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          ${activeHero.name} • Skill Upgrades
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--pyro-orange);">Attack Power</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${skills.attack * 8}% Weapon Damage</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="attack" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${skills.attack} (+1)
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--aether-cyan);">Combo Explosion Size</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${skills.comboRadius * 15}% Explosion Radius</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="comboRadius" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${skills.comboRadius} (+1)
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--success-green);">Max Health</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${skills.health * 60} Max HP</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="health" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${skills.health} (+1)
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });

    document.getElementById('btn-upgrade-wpn')?.addEventListener('click', async () => {
      if (state.crystals < upgradeCost) {
        UIManager.showToast('Not enough Crystals 💎');
        return;
      }

      sound.playLevelUp();
      const updatedWpn = {
        ...wpn,
        tier: wpn.tier + 1,
        baseDamage: Math.round(wpn.baseDamage * 1.3)
      };

      store.setState({
        crystals: state.crystals - upgradeCost,
        equippedWeapon: updatedWpn
      });

      ApiClient.upgradeWeapon(wpn.itemId);
      UIManager.showToast(`Upgraded ${updatedWpn.name} to Tier ${updatedWpn.tier}! (Damage: ${updatedWpn.baseDamage})`);
      this.renderCurrentScreen(() => {});
    });

    document.querySelectorAll('.btn-add-skill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const branch = (e.target as HTMLElement).getAttribute('data-branch') as 'attack' | 'comboRadius' | 'health';
        if (state.crystals < 100) {
          UIManager.showToast('Upgrading skill costs 100 Crystals 💎');
          return;
        }

        sound.playLevelUp();
        const updatedAlloc = { ...state.skillPointsAllocated };
        const heroAlloc = { ...(updatedAlloc[activeHero.id] || { attack: 0, comboRadius: 0, health: 0 }) };
        heroAlloc[branch] += 1;
        updatedAlloc[activeHero.id] = heroAlloc;

        store.setState({
          crystals: state.crystals - 100,
          skillPointsAllocated: updatedAlloc
        });
        UIManager.showToast(`Upgraded ${branch.toUpperCase()} to Level ${heroAlloc[branch]}!`);
        this.renderArmory(container);
      });
    });
  }

  private static renderWorldMap(container: HTMLElement) {
    const state = store.getState();
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">World Boss & Map</div>
        <button class="btn-close" id="btn-close-modal">✕</button>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 10px; border: 1px solid var(--border-glow);">
        <div style="font-size: 12px; color: var(--aether-cyan); font-weight: 800;">CURRENT WORLD EVENT</div>
        <div style="font-size: 15px; font-weight: 800; margin-top: 4px;">Purge the Volcanic Fracture</div>
        
        <div style="margin: 12px 0 6px 0; display: flex; justify-content: space-between; font-size: 12px;">
          <span>Global Purification</span>
          <span style="font-weight: 800; color: var(--aether-cyan);">35% Saved</span>
        </div>
        <div class="bar-container" style="height: 14px;">
          <div class="hp-fill" style="width: 35%; background: linear-gradient(90deg, #00f0ff, #a855f7);"></div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn-primary" id="btn-contribute-beacon">
          🌍 DONATE 100 💎 TO SAVE THE PLANET
        </button>
        <div style="font-size: 11px; color: var(--text-muted); text-align: center;">
          All players work together to unlock new game worlds!
        </div>
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });

    document.getElementById('btn-contribute-beacon')?.addEventListener('click', () => {
      if (state.crystals < 100) {
        UIManager.showToast('Requires 100 Crystals 💎');
        return;
      }
      sound.playCrystalHarvest();
      store.setState({
        crystals: state.crystals - 100
      });
      UIManager.showToast('Donated 100 Crystals to the World Goal! 🌍');
    });
  }

  private static renderLeaderboard(container: HTMLElement) {
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Top Players</div>
        <button class="btn-close" id="btn-close-modal">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(255, 214, 0, 0.15); border: 1px solid var(--volt-gold); border-radius: 8px; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900; color: var(--volt-gold); font-size: 16px;">#1</span>
            <div>
              <div style="font-weight: 800; font-size: 13px;">DragonSlayer</div>
              <div style="font-size: 10px; color: var(--text-muted);">Blaze (Fire Warrior) • Floor 15 Clear</div>
            </div>
          </div>
          <div style="font-weight: 800; color: var(--volt-gold); font-size: 14px;">184,200 PTS</div>
        </div>

        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900; color: #cbd5e1; font-size: 16px;">#2</span>
            <div>
              <div style="font-weight: 800; font-size: 13px;">NovaStorm</div>
              <div style="font-size: 10px; color: var(--text-muted);">Shadow (Dark Mage) • Floor 14 Clear</div>
            </div>
          </div>
          <div style="font-weight: 800; color: #fff; font-size: 14px;">162,500 PTS</div>
        </div>

        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900; color: #d97706; font-size: 16px;">#3</span>
            <div>
              <div style="font-weight: 800; font-size: 13px;">FrostTitan</div>
              <div style="font-size: 10px; color: var(--text-muted);">Frost (Ice Knight) • Floor 13 Clear</div>
            </div>
          </div>
          <div style="font-weight: 800; color: #fff; font-size: 14px;">148,900 PTS</div>
        </div>
      </div>

      <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">
        Ranked by highest floor clear & score • 100% Skill Based
      </div>
    `;

    container.appendChild(modal);
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });
  }

  private static renderGuild(container: HTMLElement) {
    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Guild Clan</div>
        <button class="btn-close" id="btn-close-modal">✕</button>
      </div>

      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 36px;">🛡️</div>
        <div style="font-size: 18px; font-weight: 800; color: var(--aether-cyan);">[FIRE] Solar Knights</div>
        <div style="font-size: 12px; color: var(--text-muted);">Clan Level 5 • 42/50 Members</div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 10px;">
        <div style="font-size: 12px; color: var(--volt-gold); font-weight: 800;">ACTIVE CLAN PERK</div>
        <div style="font-size: 13px; font-weight: 700; margin-top: 4px;">Fire & Wind Synergy: +10% Combo Damage</div>
      </div>

      <button class="btn-primary" id="btn-guild-contribute">
        ⚡ DONATE 150 💎 TO GUILD
      </button>
    `;

    container.appendChild(modal);
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      store.setState({ screen: 'CITADEL' });
    });

    document.getElementById('btn-guild-contribute')?.addEventListener('click', () => {
      const state = store.getState();
      if (state.crystals < 150) {
        UIManager.showToast('Not enough Crystals 💎');
        return;
      }
      sound.playCrystalHarvest();
      store.setState({ crystals: state.crystals - 150 });
      UIManager.showToast('Donated 150 💎 to Solar Knights!');
    });
  }

  private static renderExtractionSummary(container: HTMLElement) {
    const state = store.getState();
    const activeHero = state.heroes.find(h => h.id === state.activeHeroId) || state.heroes[0];

    const modal = document.createElement('div');
    modal.className = 'screen-modal glass-panel';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title" style="color: var(--success-green);">Victory! Run Complete</div>
      </div>

      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px;">🏆</div>
        <div style="font-size: 24px; font-weight: 900; color: var(--volt-gold);">+${state.currentRunScore.toLocaleString()} PTS</div>
        <div style="font-size: 12px; color: var(--text-muted);">${activeHero.name} • Floor ${state.currentFloor} Cleared</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1; background: rgba(0, 240, 255, 0.1); border: 1px solid var(--aether-cyan); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: var(--aether-cyan); font-weight: 800;">CRYSTALS WON</div>
          <div style="font-size: 20px; font-weight: 900; color: #fff;">+${state.pendingCrystals} 💎</div>
        </div>
        <div style="flex: 1; background: rgba(168, 85, 247, 0.1); border: 1px solid var(--void-purple); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: var(--void-purple); font-weight: 800;">DARK SHARDS</div>
          <div style="font-size: 20px; font-weight: 900; color: #fff;">+${state.pendingVoidShards} 🌌</div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="btn-secondary" id="btn-share-victory" style="flex: 1; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>📸</span> <span>Save Victory Card</span>
        </button>
        <button class="btn-primary" id="btn-return-citadel" style="flex: 1; font-size: 12px;">
          🏠 Back to Base
        </button>
      </div>
    `;

    container.appendChild(modal);

    document.getElementById('btn-share-victory')?.addEventListener('click', () => {
      this.renderShareVictoryBadge(state, activeHero);
    });

    document.getElementById('btn-return-citadel')?.addEventListener('click', () => {
      sound.playButtonClick();
      store.setState({
        screen: 'CITADEL',
        crystals: state.crystals + state.pendingCrystals,
        voidShards: state.voidShards + state.pendingVoidShards,
        currentSeasonScore: state.currentSeasonScore + state.currentRunScore,
        pendingCrystals: 0,
        pendingVoidShards: 0,
        currentRunScore: 0,
        currentFloor: 1
      });
    });
  }

  private static renderShareVictoryBadge(state: any, hero: HeroDefinition) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createLinearGradient(0, 0, 600, 800);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.5, '#05070c');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 800);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 760);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RIFTBOUND: BATTLE VICTORY', 300, 70);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('OFFICIAL PLAYER RECORD', 300, 100);

    ctx.font = '72px system-ui, sans-serif';
    ctx.fillText(hero.icon, 300, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText(`${hero.name} (${hero.title})`, 300, 280);

    ctx.fillStyle = '#ff5500';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`Elements: ${hero.primaryElement} + ${hero.secondaryElement}`, 300, 310);

    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.fillRect(60, 360, 480, 110);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.strokeRect(60, 360, 480, 110);

    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 42px system-ui, sans-serif';
    ctx.fillText(`${state.currentRunScore.toLocaleString()} PTS`, 300, 425);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Floor ${state.currentFloor} Purified!`, 300, 455);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`Crystals: +${state.pendingCrystals} 💎 | Dark Shards: +${state.pendingVoidShards} 🌌`, 300, 520);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('● OFFICIAL VICTORY CERTIFICATE', 300, 710);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Player: ${state.username} • Account Level ${state.accountLevel}`, 300, 735);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `riftbound_victory_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    sound.playCrystalHarvest();
    UIManager.showToast('Victory Card Saved! 📸');
  }
}
