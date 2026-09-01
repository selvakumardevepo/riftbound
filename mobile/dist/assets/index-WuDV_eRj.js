(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();class y{lastTime=0;isRunning=!1;updateFn;renderFn;constructor(e,t){this.updateFn=e,this.renderFn=t}start(){this.isRunning||(this.isRunning=!0,this.lastTime=performance.now(),requestAnimationFrame(this.loop.bind(this)))}stop(){this.isRunning=!1}loop(e){if(!this.isRunning)return;let t=(e-this.lastTime)/1e3;this.lastTime=e,t>.1&&(t=.1),this.updateFn(t),this.renderFn(),requestAnimationFrame(this.loop.bind(this))}}class x{pool=[];textPool=[];screenShake=0;constructor(e=600){for(let t=0;t<e;t++)this.pool.push({x:0,y:0,vx:0,vy:0,life:0,maxLife:1,size:2,color:"#fff",alpha:1,active:!1});for(let t=0;t<50;t++)this.textPool.push({x:0,y:0,text:"",color:"#fff",life:0,maxLife:1,active:!1,scale:1})}emit(e,t,a,i,s=2,n=4){let o=0;for(const r of this.pool)if(!r.active){r.active=!0,r.x=e,r.y=t;const p=Math.random()*Math.PI*2,u=(Math.random()*.8+.2)*s;if(r.vx=Math.cos(p)*u,r.vy=Math.sin(p)*u,r.maxLife=Math.random()*.4+.2,r.life=r.maxLife,r.color=i,r.size=n,r.alpha=1,o++,o>=a)break}}spawnFloatingText(e,t,a,i="#ffd600",s=!1){for(const n of this.textPool)if(!n.active){n.active=!0,n.x=e+(Math.random()*20-10),n.y=t-10,n.text=a,n.color=i,n.maxLife=.6,n.life=n.maxLife,n.scale=s?1.6:1;break}}triggerShake(e=6){this.screenShake=e}update(e){this.screenShake>0&&(this.screenShake=Math.max(0,this.screenShake-e*15));for(const t of this.pool)t.active&&(t.life-=e,t.life<=0?t.active=!1:(t.x+=t.vx*60*e,t.y+=t.vy*60*e,t.alpha=t.life/t.maxLife));for(const t of this.textPool)t.active&&(t.life-=e,t.life<=0?t.active=!1:t.y-=30*e)}render(e){e.save();for(const t of this.pool)t.active&&(e.globalAlpha=t.alpha,e.fillStyle=t.color,e.beginPath(),e.arc(t.x,t.y,t.size,0,Math.PI*2),e.fill());e.font="bold 13px system-ui, sans-serif",e.textAlign="center";for(const t of this.textPool)if(t.active){const a=t.life/t.maxLife;e.globalAlpha=a,e.fillStyle=t.color,e.shadowColor="#000",e.shadowBlur=4,e.fillText(t.text,t.x,t.y)}e.restore()}}class b{moveVector={x:0,y:0,isMoving:!1};isAttackPressed=!1;isDashTriggered=!1;isSkill1Triggered=!1;isSkill2Triggered=!1;touchStartX=0;touchStartY=0;activeTouchId=null;keys={};constructor(e){this.setupTouch(e),this.setupKeyboard()}setupTouch(e){e.addEventListener("touchstart",a=>{if(a.preventDefault(),this.activeTouchId===null&&a.changedTouches.length>0){const i=a.changedTouches[0];this.activeTouchId=i.identifier,this.touchStartX=i.clientX,this.touchStartY=i.clientY,this.moveVector.isMoving=!0}},{passive:!1}),e.addEventListener("touchmove",a=>{a.preventDefault();for(let i=0;i<a.changedTouches.length;i++){const s=a.changedTouches[i];if(s.identifier===this.activeTouchId){const n=s.clientX-this.touchStartX,o=s.clientY-this.touchStartY,r=Math.sqrt(n*n+o*o),p=45;if(r>5){const u=Math.atan2(o,n),c=Math.min(r,p);this.moveVector.x=Math.cos(u)*(c/p),this.moveVector.y=Math.sin(u)*(c/p)}break}}},{passive:!1});const t=a=>{for(let i=0;i<a.changedTouches.length;i++)if(a.changedTouches[i].identifier===this.activeTouchId){this.activeTouchId=null,this.moveVector.x=0,this.moveVector.y=0,this.moveVector.isMoving=!1;break}};e.addEventListener("touchend",t),e.addEventListener("touchcancel",t)}setupKeyboard(){window.addEventListener("keydown",e=>{this.keys[e.code]=!0,e.code==="Space"&&(this.isDashTriggered=!0),e.code==="KeyJ"&&(this.isAttackPressed=!0),e.code==="KeyK"&&(this.isSkill1Triggered=!0),e.code==="KeyL"&&(this.isSkill2Triggered=!0),this.updateKeyboardVector()}),window.addEventListener("keyup",e=>{this.keys[e.code]=!1,e.code==="KeyJ"&&(this.isAttackPressed=!1),this.updateKeyboardVector()})}updateKeyboardVector(){let e=0,t=0;if((this.keys.KeyW||this.keys.ArrowUp)&&(t-=1),(this.keys.KeyS||this.keys.ArrowDown)&&(t+=1),(this.keys.KeyA||this.keys.ArrowLeft)&&(e-=1),(this.keys.KeyD||this.keys.ArrowRight)&&(e+=1),e!==0||t!==0){const a=Math.sqrt(e*e+t*t);this.moveVector.x=e/a,this.moveVector.y=t/a,this.moveVector.isMoving=!0}else this.activeTouchId===null&&(this.moveVector.x=0,this.moveVector.y=0,this.moveVector.isMoving=!1)}consumeDash(){const e=this.isDashTriggered;return this.isDashTriggered=!1,e}consumeSkill1(){const e=this.isSkill1Triggered;return this.isSkill1Triggered=!1,e}consumeSkill2(){const e=this.isSkill2Triggered;return this.isSkill2Triggered=!1,e}}class T{ctx=null;isMuted=!1;initContext(){if(!this.ctx){const e=window.AudioContext||window.webkitAudioContext;this.ctx=new e}this.ctx.state==="suspended"&&this.ctx.resume()}playSlash(){if(this.isMuted||(this.initContext(),!this.ctx))return;const e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sawtooth",e.frequency.setValueAtTime(450,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(80,this.ctx.currentTime+.12),t.gain.setValueAtTime(.3,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+.12),e.connect(t),t.connect(this.ctx.destination),e.start(),e.stop(this.ctx.currentTime+.12)}playResonanceDetonation(){if(this.isMuted||(this.initContext(),!this.ctx))return;const e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(150,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(40,this.ctx.currentTime+.35),t.gain.setValueAtTime(.6,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+.35),e.connect(t),t.connect(this.ctx.destination),e.start(),e.stop(this.ctx.currentTime+.35)}playCrystalHarvest(){if(this.isMuted||(this.initContext(),!this.ctx))return;[523.25,659.25,783.99,1046.5].forEach((t,a)=>{const i=this.ctx.createOscillator(),s=this.ctx.createGain();i.type="triangle",i.frequency.setValueAtTime(t,this.ctx.currentTime+a*.05),s.gain.setValueAtTime(.2,this.ctx.currentTime+a*.05),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+a*.05+.2),i.connect(s),s.connect(this.ctx.destination),i.start(this.ctx.currentTime+a*.05),i.stop(this.ctx.currentTime+a*.05+.2)})}playLevelUp(){if(this.isMuted||(this.initContext(),!this.ctx))return;[440,554.37,659.25,880].forEach((t,a)=>{const i=this.ctx.createOscillator(),s=this.ctx.createGain();i.type="sine",i.frequency.setValueAtTime(t,this.ctx.currentTime+a*.08),s.gain.setValueAtTime(.3,this.ctx.currentTime+a*.08),s.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+a*.08+.3),i.connect(s),s.connect(this.ctx.destination),i.start(this.ctx.currentTime+a*.08),i.stop(this.ctx.currentTime+a*.08+.3)})}playButtonClick(){if(this.isMuted||(this.initContext(),!this.ctx))return;const e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(800,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(400,this.ctx.currentTime+.04),t.gain.setValueAtTime(.15,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+.04),e.connect(t),t.connect(this.ctx.destination),e.start(),e.stop(this.ctx.currentTime+.04)}}const d=new T;class S{static reactions={"PYRO+GALE":{name:"FIRE TORNADO",damageMultiplier:2.5,aoeRadius:170,color:"#ff5500",effectType:"VORTEX",description:"Massive spinning flame cyclone that burns all nearby enemies!"},"CRYO+VOLT":{name:"SUPER SHOCK",damageMultiplier:2.8,aoeRadius:150,color:"#00e5ff",effectType:"SHATTER",description:"Freezes and electrifies enemies, breaking their armor!"},"PYRO+VOID":{name:"DARK EXPLOSION",damageMultiplier:3.2,aoeRadius:210,color:"#a855f7",effectType:"COLLAPSE",description:"Sucks enemies into a black hole that explodes for huge damage!"},"CRYO+GALE":{name:"BLIZZARD FREEZE",damageMultiplier:2.2,aoeRadius:180,color:"#76ffff",effectType:"FREEZE",description:"Freezes the entire room and boosts critical strike chance!"},"VOLT+VOID":{name:"MEGA PULSE",damageMultiplier:2.6,aoeRadius:160,color:"#ffd600",effectType:"EMP",description:"Shockwave that silences enemy attacks and cools down your skills!"}};static checkReaction(e,t){if(e==="PHYSICAL"||t==="PHYSICAL"||e===t)return null;const a=`${e}+${t}`,i=`${t}+${e}`;return this.reactions[a]||this.reactions[i]||null}}class k{projectiles=[];totalDamageDealt=0;totalDamageTaken=0;resonancesTriggered=0;constructor(){for(let e=0;e<200;e++)this.projectiles.push({x:0,y:0,vx:0,vy:0,radius:6,damage:10,element:"PHYSICAL",color:"#fff",isHero:!0,pierce:1,life:1,active:!1})}spawnProjectile(e,t,a,i,s,n,o=!0,r="#00f0ff",p=6,u=1){for(const c of this.projectiles)if(!c.active){c.active=!0,c.x=e,c.y=t,c.vx=Math.cos(a)*i,c.vy=Math.sin(a)*i,c.damage=s,c.element=n,c.isHero=o,c.color=r,c.radius=p,c.pierce=u,c.life=2;break}}updateProjectiles(e,t,a,i){for(const s of this.projectiles)if(s.active){if(s.life-=e,s.life<=0){s.active=!1;continue}if(s.x+=s.vx*e,s.y+=s.vy*e,Math.random()<.35&&i.emit(s.x,s.y,1,s.color,.5,2),s.isHero){for(const n of t)if(!n.isDead){const o=s.x-n.x,r=s.y-n.y;if(Math.sqrt(o*o+r*r)<s.radius+n.radius&&(this.hitEnemy(n,s.damage,s.element,a,i),s.pierce--,s.pierce<=0)){s.active=!1;break}}}else if(a.iFrameTimer<=0){const n=s.x-a.x,o=s.y-a.y;Math.sqrt(n*n+o*o)<s.radius+a.radius&&(this.hitHero(a,s.damage,i),s.active=!1)}}}hitEnemy(e,t,a,i,s){let n=t,o=Math.random()<.28;if(o&&(n=Math.round(n*1.65)),e.appliedElement&&e.appliedElement!==a&&e.elementTimer>0){const r=S.checkReaction(e.appliedElement,a);r&&(n=Math.round(n*r.damageMultiplier),this.resonancesTriggered++,s.triggerShake(8),s.emit(e.x,e.y,40,r.color,4.5,5),s.spawnFloatingText(e.x,e.y-20,r.name.toUpperCase()+"!",r.color,!0),d.playResonanceDetonation(),e.appliedElement=null,e.elementTimer=0)}else a!=="PHYSICAL"&&(e.appliedElement=a,e.elementTimer=3.2);e.hp-=n,this.totalDamageDealt+=n,i.comboCount++,i.comboTimer=2.5,s.emit(e.x,e.y,8,o?"#ffd600":"#ffffff",2.5,3),s.spawnFloatingText(e.x,e.y,n.toString(),o?"#ffd600":"#ffffff",o),e.hp<=0&&(e.isDead=!0,s.emit(e.x,e.y,30,e.color,3.5,4),d.playCrystalHarvest())}hitHero(e,t,a){e.iFrameTimer>0||(e.hp=Math.max(0,e.hp-t),this.totalDamageTaken+=t,e.iFrameTimer=.5,a.triggerShake(10),a.emit(e.x,e.y,22,"#ef4444",3,3),a.spawnFloatingText(e.x,e.y,"-"+t,"#ef4444",!0))}}class m{static create(e,t,a,i=1){const s="en_"+Math.random().toString(36).substring(2,9);switch(e){case"VOID_WISP":return{id:s,x:t,y:a,vx:0,vy:0,radius:14,maxHp:Math.round(120*i),hp:Math.round(120*i),type:e,color:"#c084fc",speed:85,attackCooldown:1,appliedElement:null,elementTimer:0,telegraphTimer:0,isTelegraphing:!1,telegraphRadius:28,isDead:!1};case"ARMORED_BRUTE":return{id:s,x:t,y:a,vx:0,vy:0,radius:24,maxHp:Math.round(380*i),hp:Math.round(380*i),type:e,color:"#f97316",speed:45,attackCooldown:2.2,appliedElement:null,elementTimer:0,telegraphTimer:0,isTelegraphing:!1,telegraphRadius:65,isDead:!1};case"VOID_ARCANIST":return{id:s,x:t,y:a,vx:0,vy:0,radius:18,maxHp:Math.round(200*i),hp:Math.round(200*i),type:e,color:"#38bdf8",speed:60,attackCooldown:2.5,appliedElement:null,elementTimer:0,telegraphTimer:0,isTelegraphing:!1,telegraphRadius:40,isDead:!1};case"RIFT_GUARDIAN_BOSS":return{id:s,x:t,y:a,vx:0,vy:0,radius:40,maxHp:Math.round(1800*i),hp:Math.round(1800*i),type:e,color:"#ef4444",speed:40,attackCooldown:1.8,appliedElement:null,elementTimer:0,telegraphTimer:0,isTelegraphing:!1,telegraphRadius:120,isDead:!1}}}}class E{static generateRoom(e,t,a){const i=[],s=4+e*2,n=e%5===0;if(n)i.push(m.create("RIFT_GUARDIAN_BOSS",t/2,a/2-100,1+e*.2)),i.push(m.create("ARMORED_BRUTE",t/2-120,a/2-50,1)),i.push(m.create("ARMORED_BRUTE",t/2+120,a/2-50,1));else for(let o=0;o<s;o++){const r=Math.random()*(t-160)+80,p=Math.random()*(a-240)+80,u=Math.random();u<.5?i.push(m.create("VOID_WISP",r,p,1+e*.1)):u<.8?i.push(m.create("ARMORED_BRUTE",r,p,1+e*.1)):i.push(m.create("VOID_ARCANIST",r,p,1+e*.1))}return{floorNumber:e,width:t,height:a,enemies:i,isCleared:!1,biome:n?"VOID_CORE":"FRACTURED_CHASM",hazardType:e>2?"AETHER_INSTABILITY":null}}}class w{state;listeners=[];constructor(){const e=localStorage.getItem("riftbound_state_v3");if(e)try{this.state=JSON.parse(e)}catch{this.state=this.getDefaultState()}else this.state=this.getDefaultState()}getDefaultState(){const e=[{id:"hero_blaze",name:"Blaze",title:"Fire Warrior",icon:"🔥",primaryElement:"PYRO",secondaryElement:"GALE",baseHp:600,baseSpeed:180,description:"Fast swordfighter. Shoots fire slashes and launches wind whirlwinds.",skill1Name:"Wind Whirlwind",skill2Name:"Fire Blast",passivePerk:"+15% Speed after dodging",isUnlocked:!0},{id:"hero_frost",name:"Frost",title:"Ice Knight",icon:"❄️",primaryElement:"CRYO",secondaryElement:"VOLT",baseHp:850,baseSpeed:155,description:"Heavy tank with ice shield. Freezes enemies and shocks them with lightning.",skill1Name:"Ice Stasis",skill2Name:"Thunder Burst",passivePerk:"Takes 30% less damage when shielding",isUnlocked:!0},{id:"hero_shadow",name:"Shadow",title:"Dark Mage",icon:"🔮",primaryElement:"VOID",secondaryElement:"PYRO",baseHp:520,baseSpeed:170,description:"Dark magic master. Creates black holes that pull enemies into giant explosions.",skill1Name:"Black Hole",skill2Name:"Dark Nova",passivePerk:"Combos pull nearby enemies together",isUnlocked:!0},{id:"hero_volt",name:"Volt",title:"Thunder Hunter",icon:"⚡",primaryElement:"VOLT",secondaryElement:"GALE",baseHp:580,baseSpeed:190,description:"High-speed shooter. Fires rapid lightning beams that pierce through multiple enemies.",skill1Name:"Shock Wave",skill2Name:"Lightning Storm",passivePerk:"Attacks pierce through 1 extra enemy",isUnlocked:!0}],t=[];for(let a=1;a<=10;a++)t.push({tier:a,freeReward:`${a*200} Crystals 💎`,freeClaimed:!1,premiumReward:a%3===0?`Costume: Gold ${e[a%4].name}`:`${a*30} Dark Shards 🌌`,premiumClaimed:!1,xpRequired:a*500});return{screen:"CITADEL",userId:"usr_player_"+Math.random().toString(36).substring(2,7),username:"Hero Vanguard",token:null,accountLevel:1,masteryXp:0,crystals:1500,voidShards:80,starCores:15,currentSeasonScore:0,activeHeroId:"hero_blaze",heroes:e,skillPointsAllocated:{hero_blaze:{attack:2,comboRadius:1,health:1},hero_frost:{attack:0,comboRadius:1,health:3},hero_shadow:{attack:3,comboRadius:1,health:0},hero_volt:{attack:2,comboRadius:2,health:0}},equippedWeapon:{id:"wpn_01",itemId:"wpn_flame_sword",name:"Flame Blade",tier:1,baseDamage:80,element:"PYRO"},currentFloor:1,currentRunSessionId:null,currentRunScore:0,pendingCrystals:0,pendingVoidShards:0,battlePassXp:1200,battlePassTiers:t,isPremiumPassUnlocked:!1,hasCompletedTutorial:!1}}getState(){return{...this.state}}setState(e){this.state={...this.state,...e},localStorage.setItem("riftbound_state_v3",JSON.stringify(this.state)),this.notify()}subscribe(e){return this.listeners.push(e),e(this.getState()),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){const e=this.getState();for(const t of this.listeners)t(e)}}const l=new w;class h{static showToast(e){const t=document.getElementById("toast-container");if(!t)return;const a=document.createElement("div");a.className="toast-msg",a.textContent=e,t.appendChild(a),setTimeout(()=>{a.parentElement&&a.parentElement.removeChild(a)},2400)}static renderTopBar(){const e=document.getElementById("top-bar-container");if(!e)return;const t=l.getState();e.innerHTML=`
      <div class="top-bar glass-panel">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00f0ff, #ffd600); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #000;">
            ${t.accountLevel}
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #00f0ff;">${t.username}</div>
            <div style="font-size: 10px; color: var(--text-muted);">Score: ${t.currentSeasonScore.toLocaleString()} pts</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <div class="currency-pill" title="Crystals (Main Upgrade Currency)">
            <span>💎</span>
            <span style="color: #00f0ff;">${t.crystals.toLocaleString()}</span>
          </div>
          <div class="currency-pill" title="Dark Shards (Rare Crafting Material)">
            <span>🌌</span>
            <span style="color: #c084fc;">${t.voidShards.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `}static renderNavigation(){const e=document.getElementById("nav-container");if(!e)return;const t=l.getState();if(t.screen==="RIFT_COMBAT"||t.screen==="TUTORIAL"){e.innerHTML="";return}e.innerHTML=`
      <div class="nav-tab-bar glass-panel">
        <button class="nav-btn ${t.screen==="CITADEL"?"active":""}" id="nav-home">
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button class="nav-btn ${t.screen==="HERO_ROSTER"?"active":""}" id="nav-heroes">
          <span>🦸</span>
          <span>Heroes</span>
        </button>
        <button class="nav-btn ${t.screen==="ARMORY"?"active":""}" id="nav-gear">
          <span>⚔️</span>
          <span>Gear</span>
        </button>
        <button class="nav-btn ${t.screen==="WORLD_MAP"?"active":""}" id="nav-world">
          <span>🌍</span>
          <span>World</span>
        </button>
        <button class="nav-btn ${t.screen==="LEADERBOARD"?"active":""}" id="nav-ranks">
          <span>🏆</span>
          <span>Ranks</span>
        </button>
        <button class="nav-btn ${t.screen==="GUILD"?"active":""}" id="nav-guild">
          <span>🛡️</span>
          <span>Guild</span>
        </button>
      </div>
    `,document.getElementById("nav-home")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"CITADEL"})}),document.getElementById("nav-heroes")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"HERO_ROSTER"})}),document.getElementById("nav-gear")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"ARMORY"})}),document.getElementById("nav-world")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"WORLD_MAP"})}),document.getElementById("nav-ranks")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"LEADERBOARD"})}),document.getElementById("nav-guild")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"GUILD"})})}}const R={},C=R?.VITE_API_URL||"http://localhost:8000/api/v1";class v{static async request(e,t={}){const a=l.getState(),i={"Content-Type":"application/json",...t.headers||{}};a.token&&(i.Authorization=`Bearer ${a.token}`);try{const s=await fetch(`${C}${e}`,{...t,headers:i});return s.ok?await s.json():(console.warn(`API request to ${e} failed with status:`,s.status),null)}catch{return null}}static async autoLoginGuest(){const e=await this.request("/auth/guest",{method:"POST"});return e&&e.access_token?(l.setState({token:e.access_token,userId:e.user_id,username:e.username}),!0):!1}static async startRiftRun(e,t){return await this.request("/rift/start",{method:"POST",body:JSON.stringify({hero_id:e,rift_tier:t})})}static async completeFloor(e,t,a){return await this.request("/rift/floor/complete",{method:"POST",body:JSON.stringify({session_id:e,floor_number:t,combat_metrics:a})})}static async extractRun(e){return await this.request("/rift/extract",{method:"POST",body:JSON.stringify({session_id:e})})}static async upgradeWeapon(e){return await this.request("/forge/upgrade",{method:"POST",body:JSON.stringify({item_id:e,upgrade_type:"ENHANCE_TIER"})})}static async getLeaderboards(){return await this.request("/leaderboards/chrono-trials")}static async getWorldState(){return await this.request("/liveops/world-state")}static async contributeToGuild(e){return await this.request("/guild/contribute",{method:"POST",body:JSON.stringify({aether_amount:e})})}}class L{static tutorialStep=1;static renderCurrentScreen(e){const t=document.getElementById("modal-container");if(!t)return;const a=l.getState();if(t.innerHTML="",!a.hasCompletedTutorial&&a.screen==="CITADEL"){this.renderTutorial(t,e);return}switch(a.screen){case"TUTORIAL":this.renderTutorial(t,e);break;case"CITADEL":this.renderCitadel(t,e);break;case"ARMORY":this.renderArmory(t);break;case"HERO_ROSTER":this.renderHeroRoster(t);break;case"BATTLE_PASS":this.renderBattlePass(t);break;case"WORLD_MAP":this.renderWorldMap(t);break;case"LEADERBOARD":this.renderLeaderboard(t);break;case"GUILD":this.renderGuild(t);break;case"EXTRACTION_SUMMARY":this.renderExtractionSummary(t);break}}static renderTutorial(e,t){e.innerHTML="";const a=document.createElement("div");a.className="screen-modal glass-panel";const i=[{title:"🕹️ Step 1: Move & Aim",icon:"🏃‍♂️",headline:"Drag to move. Shooting is automatic!",details:"Drag anywhere on your screen (or use WASD on desktop) to move. Your hero automatically aims and fires elemental blasts at the nearest monster.",color:"#00f0ff"},{title:"🔥 Step 2: Combine Elements!",icon:"🌪️",headline:"Fire + Wind = Fire Tornado!",details:"Hit enemies with your weapon, then tap your Skill button. Combining elements triggers huge explosions like Fire Tornado 🔥, Super Shock ⚡, or Dark Blast 💥!",color:"#ff5500"},{title:"⚡ Step 3: Dodge Danger",icon:"🛡️",headline:"Red circles mean danger!",details:"When monsters attack, red danger zones will light up on the ground. Tap Dash to phase right through them with 100% invulnerability!",color:"#ffd600"},{title:"🚪 Step 4: Extract or Push Deeper!",icon:"💎",headline:"Safe Bank vs High Risk Loot",details:"When you defeat all monsters, step into the Green Portal to safely keep all your Crystals 💎, or step into the Purple Portal for 3x Bonus Loot!",color:"#10b981"}];this.tutorialStep<1&&(this.tutorialStep=1),this.tutorialStep>4&&(this.tutorialStep=4);const s=i[this.tutorialStep-1];a.innerHTML=`
      <div class="modal-header">
        <div class="modal-title" style="color: ${s.color};">${s.title}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: var(--text-muted); font-weight: bold;">${this.tutorialStep} of 4</span>
          <button class="btn-close" id="btn-close-tutorial" title="Skip Tutorial">✕</button>
        </div>
      </div>

      <div style="text-align: center; padding: 16px 0;">
        <div style="font-size: 56px; margin-bottom: 8px;">${s.icon}</div>
        <div style="font-size: 17px; font-weight: 800; color: #fff;">${s.headline}</div>
        <div style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-top: 8px; padding: 0 10px;">
          ${s.details}
        </div>
      </div>

      <!-- Interactive Clickable Step Dots -->
      <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px;">
        ${i.map((o,r)=>`
          <button class="btn-tutorial-dot" data-step="${r+1}" style="cursor: pointer; border: none; width: ${r+1===this.tutorialStep?"28px":"10px"}; height: 10px; border-radius: 5px; background: ${r+1===this.tutorialStep?s.color:"rgba(255,255,255,0.25)"}; transition: all 0.2s;"></button>
        `).join("")}
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 8px;">
          ${this.tutorialStep>1?`
            <button class="btn-secondary" id="btn-prev-tutorial" style="flex: 1; padding: 12px; font-size: 13px; font-weight: bold;">
              ◀ PREV
            </button>
          `:""}
          ${this.tutorialStep<4?`
            <button class="btn-primary" id="btn-next-tutorial" style="flex: 2; font-size: 14px; padding: 12px;">
              NEXT (STEP ${this.tutorialStep+1}) ▶
            </button>
          `:`
            <button class="btn-primary" id="btn-finish-tutorial" style="flex: 1; font-size: 15px; padding: 14px; background: linear-gradient(135deg, #10b981, #00f0ff);">
              🚀 PLAY NOW (+500 💎 BONUS!)
            </button>
          `}
        </div>

        <button class="btn-secondary" id="btn-skip-tutorial" style="padding: 10px; font-size: 12px; color: var(--text-muted); border-color: rgba(255,255,255,0.15);">
          Skip Tutorial & Go to Base
        </button>
      </div>
    `,e.appendChild(a),document.getElementById("btn-next-tutorial")?.addEventListener("click",()=>{d.playButtonClick(),this.tutorialStep++,this.renderTutorial(e,t)}),document.getElementById("btn-prev-tutorial")?.addEventListener("click",()=>{d.playButtonClick(),this.tutorialStep--,this.renderTutorial(e,t)}),document.querySelectorAll(".btn-tutorial-dot").forEach(o=>{o.addEventListener("click",r=>{const p=parseInt(r.target.getAttribute("data-step")||"1",10);d.playButtonClick(),this.tutorialStep=p,this.renderTutorial(e,t)})});const n=()=>{d.playButtonClick(),this.tutorialStep=1,l.setState({hasCompletedTutorial:!0,screen:"CITADEL"}),h.showToast("Welcome to the Base!")};document.getElementById("btn-skip-tutorial")?.addEventListener("click",n),document.getElementById("btn-close-tutorial")?.addEventListener("click",n),document.getElementById("btn-finish-tutorial")?.addEventListener("click",()=>{d.playLevelUp();const o=l.getState();this.tutorialStep=1,l.setState({hasCompletedTutorial:!0,crystals:o.crystals+500,screen:"CITADEL"}),h.showToast("Tutorial Complete! +500 Bonus Crystals Awarded 💎"),t()})}static renderCitadel(e,t){const a=l.getState(),i=a.heroes.find(n=>n.id===a.activeHeroId)||a.heroes[0],s=document.createElement("div");s.className="screen-modal glass-panel",s.innerHTML=`
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
          ${i.icon}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 15px; font-weight: 800; color: #fff;">${i.name} • ${i.title}</div>
          <div style="font-size: 12px; color: var(--aether-cyan);">${i.primaryElement} + ${i.secondaryElement} Element</div>
          <div style="font-size: 11px; color: var(--text-muted);">Weapon: ${a.equippedWeapon.name} (Tier ${a.equippedWeapon.tier})</div>
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
          ▶ PLAY BATTLE (FLOOR ${a.currentFloor})
        </button>
        <div style="text-align: center; font-size: 11px; color: var(--text-muted);">
          No energy timers • Play anytime • Pure skill & combos
        </div>
      </div>
    `,e.appendChild(s),document.getElementById("btn-reopen-tutorial")?.addEventListener("click",()=>{d.playButtonClick(),this.tutorialStep=1,this.renderTutorial(e,t)}),document.getElementById("btn-enter-rift")?.addEventListener("click",()=>{d.playButtonClick(),t()}),document.getElementById("btn-open-roster")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"HERO_ROSTER"})}),document.getElementById("btn-open-battlepass")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"BATTLE_PASS"})}),document.getElementById("btn-open-skills")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"ARMORY"})})}static renderHeroRoster(e){const t=l.getState(),a=document.createElement("div");a.className="screen-modal glass-panel",a.innerHTML=`
      <div class="modal-header">
        <div class="modal-title">Choose Your Hero</div>
        <button class="btn-close" id="btn-close-roster">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${t.heroes.map(i=>`
          <div style="display: flex; gap: 12px; align-items: center; background: ${i.id===t.activeHeroId?"rgba(0, 240, 255, 0.15)":"rgba(0, 0, 0, 0.35)"}; border: 1px solid ${i.id===t.activeHeroId?"var(--aether-cyan)":"rgba(255,255,255,0.1)"}; padding: 12px; border-radius: 12px;">
            <div style="font-size: 34px; width: 48px; text-align: center;">${i.icon}</div>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 800; color: #fff;">${i.name} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${i.title})</span></div>
              <div style="font-size: 11px; color: var(--aether-cyan); margin: 2px 0;">Elements: ${i.primaryElement} + ${i.secondaryElement}</div>
              <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${i.description}</div>
              <div style="font-size: 10px; color: var(--volt-gold); margin-top: 4px;">Skills: 1. ${i.skill1Name} | 2. ${i.skill2Name}</div>
            </div>
            <div>
              ${i.id===t.activeHeroId?`
                <span style="font-size: 11px; font-weight: 800; color: var(--success-green); padding: 4px 8px; background: rgba(16,185,129,0.15); border-radius: 6px;">SELECTED</span>
              `:`
                <button class="btn-primary btn-select-hero" data-hero-id="${i.id}" style="padding: 6px 12px; font-size: 11px;">
                  CHOOSE
                </button>
              `}
            </div>
          </div>
        `).join("")}
      </div>
    `,e.appendChild(a),document.getElementById("btn-close-roster")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})}),document.querySelectorAll(".btn-select-hero").forEach(i=>{i.addEventListener("click",s=>{const n=s.target.getAttribute("data-hero-id");if(n){d.playLevelUp();const o=t.heroes.find(r=>r.id===n);l.setState({activeHeroId:n,equippedWeapon:{...t.equippedWeapon,element:o.primaryElement}}),h.showToast(`Selected ${o.name}!`),this.renderHeroRoster(e)}})})}static renderBattlePass(e){const t=l.getState(),a=document.createElement("div");a.className="screen-modal glass-panel",a.innerHTML=`
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
        ${t.battlePassTiers.map(i=>`
          <div style="display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;">
              ${i.tier}
            </div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; color: var(--aether-cyan);">Free: ${i.freeReward}</div>
              <div style="font-size: 11px; color: var(--void-purple);">Bonus: ${i.premiumReward}</div>
            </div>
            <div>
              <button class="btn-secondary btn-claim-tier" style="padding: 4px 10px; font-size: 10px;" ${i.tier<=3?"":'disabled style="opacity:0.4"'}>
                ${i.tier<=3?"CLAIM":"LOCKED"}
              </button>
            </div>
          </div>
        `).join("")}
      </div>

      <div style="font-size: 11px; color: var(--text-muted); text-align: center;">
        Free for everyone • Play battles to earn XP and claim rewards
      </div>
    `,e.appendChild(a),document.getElementById("btn-close-bp")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})}),document.querySelectorAll(".btn-claim-tier").forEach(i=>{i.addEventListener("click",()=>{d.playCrystalHarvest(),h.showToast("Claimed Free Season Reward!")})})}static renderArmory(e){const t=l.getState(),a=t.equippedWeapon,i=a.tier*250,s=t.heroes.find(r=>r.id===t.activeHeroId)||t.heroes[0],n=t.skillPointsAllocated[s.id]||{attack:0,comboRadius:0,health:0},o=document.createElement("div");o.className="screen-modal glass-panel",o.innerHTML=`
      <div class="modal-header">
        <div class="modal-title">Gear & Skill Upgrades</div>
        <button class="btn-close" id="btn-close-modal">✕</button>
      </div>

      <!-- Weapon Section -->
      <div style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid var(--border-glow);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: var(--aether-cyan);">${a.name}</div>
            <div style="font-size: 11px; color: var(--pyro-orange); font-weight: 700;">TIER ${a.tier} • ${a.element} ELEMENT</div>
          </div>
          <div style="font-size: 32px;">🔥</div>
        </div>

        <div style="display: flex; justify-content: space-around; margin: 12px 0 8px 0;">
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">Damage</div>
            <div style="font-size: 16px; font-weight: 800; color: #fff;">${a.baseDamage}</div>
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

        <button class="btn-primary" id="btn-upgrade-wpn" style="width: 100%; padding: 10px; font-size: 12px;" ${t.crystals<i?'disabled style="opacity:0.5"':""}>
          ⚡ UPGRADE TO TIER ${a.tier+1} (${i} 💎)
        </button>
      </div>

      <!-- Hero Skill Points -->
      <div style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          ${s.name} • Skill Upgrades
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--pyro-orange);">Attack Power</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${n.attack*8}% Weapon Damage</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="attack" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${n.attack} (+1)
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--aether-cyan);">Combo Explosion Size</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${n.comboRadius*15}% Explosion Radius</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="comboRadius" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${n.comboRadius} (+1)
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 8px;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--success-green);">Max Health</div>
              <div style="font-size: 10px; color: var(--text-muted);">+${n.health*60} Max HP</div>
            </div>
            <button class="btn-secondary btn-add-skill" data-branch="health" style="padding: 4px 10px; font-size: 11px;">
              Lv. ${n.health} (+1)
            </button>
          </div>
        </div>
      </div>
    `,e.appendChild(o),document.getElementById("btn-close-modal")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})}),document.getElementById("btn-upgrade-wpn")?.addEventListener("click",async()=>{if(t.crystals<i){h.showToast("Not enough Crystals 💎");return}d.playLevelUp();const r={...a,tier:a.tier+1,baseDamage:Math.round(a.baseDamage*1.3)};l.setState({crystals:t.crystals-i,equippedWeapon:r}),v.upgradeWeapon(a.itemId),h.showToast(`Upgraded ${r.name} to Tier ${r.tier}! (Damage: ${r.baseDamage})`),this.renderCurrentScreen(()=>{})}),document.querySelectorAll(".btn-add-skill").forEach(r=>{r.addEventListener("click",p=>{const u=p.target.getAttribute("data-branch");if(t.crystals<100){h.showToast("Upgrading skill costs 100 Crystals 💎");return}d.playLevelUp();const c={...t.skillPointsAllocated},g={...c[s.id]||{attack:0,comboRadius:0,health:0}};g[u]+=1,c[s.id]=g,l.setState({crystals:t.crystals-100,skillPointsAllocated:c}),h.showToast(`Upgraded ${u.toUpperCase()} to Level ${g[u]}!`),this.renderArmory(e)})})}static renderWorldMap(e){const t=l.getState(),a=document.createElement("div");a.className="screen-modal glass-panel",a.innerHTML=`
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
    `,e.appendChild(a),document.getElementById("btn-close-modal")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})}),document.getElementById("btn-contribute-beacon")?.addEventListener("click",()=>{if(t.crystals<100){h.showToast("Requires 100 Crystals 💎");return}d.playCrystalHarvest(),l.setState({crystals:t.crystals-100}),h.showToast("Donated 100 Crystals to the World Goal! 🌍")})}static renderLeaderboard(e){const t=document.createElement("div");t.className="screen-modal glass-panel",t.innerHTML=`
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
    `,e.appendChild(t),document.getElementById("btn-close-modal")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})})}static renderGuild(e){const t=document.createElement("div");t.className="screen-modal glass-panel",t.innerHTML=`
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
    `,e.appendChild(t),document.getElementById("btn-close-modal")?.addEventListener("click",()=>{l.setState({screen:"CITADEL"})}),document.getElementById("btn-guild-contribute")?.addEventListener("click",()=>{const a=l.getState();if(a.crystals<150){h.showToast("Not enough Crystals 💎");return}d.playCrystalHarvest(),l.setState({crystals:a.crystals-150}),h.showToast("Donated 150 💎 to Solar Knights!")})}static renderExtractionSummary(e){const t=l.getState(),a=t.heroes.find(s=>s.id===t.activeHeroId)||t.heroes[0],i=document.createElement("div");i.className="screen-modal glass-panel",i.innerHTML=`
      <div class="modal-header">
        <div class="modal-title" style="color: var(--success-green);">Victory! Run Complete</div>
      </div>

      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px;">🏆</div>
        <div style="font-size: 24px; font-weight: 900; color: var(--volt-gold);">+${t.currentRunScore.toLocaleString()} PTS</div>
        <div style="font-size: 12px; color: var(--text-muted);">${a.name} • Floor ${t.currentFloor} Cleared</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1; background: rgba(0, 240, 255, 0.1); border: 1px solid var(--aether-cyan); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: var(--aether-cyan); font-weight: 800;">CRYSTALS WON</div>
          <div style="font-size: 20px; font-weight: 900; color: #fff;">+${t.pendingCrystals} 💎</div>
        </div>
        <div style="flex: 1; background: rgba(168, 85, 247, 0.1); border: 1px solid var(--void-purple); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: var(--void-purple); font-weight: 800;">DARK SHARDS</div>
          <div style="font-size: 20px; font-weight: 900; color: #fff;">+${t.pendingVoidShards} 🌌</div>
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
    `,e.appendChild(i),document.getElementById("btn-share-victory")?.addEventListener("click",()=>{this.renderShareVictoryBadge(t,a)}),document.getElementById("btn-return-citadel")?.addEventListener("click",()=>{d.playButtonClick(),l.setState({screen:"CITADEL",crystals:t.crystals+t.pendingCrystals,voidShards:t.voidShards+t.pendingVoidShards,currentSeasonScore:t.currentSeasonScore+t.currentRunScore,pendingCrystals:0,pendingVoidShards:0,currentRunScore:0,currentFloor:1})})}static renderShareVictoryBadge(e,t){const a=document.createElement("canvas");a.width=600,a.height=800;const i=a.getContext("2d"),s=i.createLinearGradient(0,0,600,800);s.addColorStop(0,"#0a0f1d"),s.addColorStop(.5,"#05070c"),s.addColorStop(1,"#020306"),i.fillStyle=s,i.fillRect(0,0,600,800),i.strokeStyle="#00f0ff",i.lineWidth=4,i.strokeRect(20,20,560,760),i.fillStyle="#00f0ff",i.font="bold 24px system-ui, sans-serif",i.textAlign="center",i.fillText("RIFTBOUND: BATTLE VICTORY",300,70),i.fillStyle="#9ca3af",i.font="14px system-ui, sans-serif",i.fillText("OFFICIAL PLAYER RECORD",300,100),i.font="72px system-ui, sans-serif",i.fillText(t.icon,300,220),i.fillStyle="#ffffff",i.font="bold 30px system-ui, sans-serif",i.fillText(`${t.name} (${t.title})`,300,280),i.fillStyle="#ff5500",i.font="bold 16px system-ui, sans-serif",i.fillText(`Elements: ${t.primaryElement} + ${t.secondaryElement}`,300,310),i.fillStyle="rgba(0, 240, 255, 0.1)",i.fillRect(60,360,480,110),i.strokeStyle="rgba(0, 240, 255, 0.4)",i.strokeRect(60,360,480,110),i.fillStyle="#ffd600",i.font="bold 42px system-ui, sans-serif",i.fillText(`${e.currentRunScore.toLocaleString()} PTS`,300,425),i.fillStyle="#cbd5e1",i.font="14px system-ui, sans-serif",i.fillText(`Floor ${e.currentFloor} Purified!`,300,455),i.fillStyle="#00f0ff",i.font="bold 18px system-ui, sans-serif",i.fillText(`Crystals: +${e.pendingCrystals} 💎 | Dark Shards: +${e.pendingVoidShards} 🌌`,300,520),i.fillStyle="#10b981",i.font="bold 14px system-ui, sans-serif",i.fillText("● OFFICIAL VICTORY CERTIFICATE",300,710),i.fillStyle="#6b7280",i.font="12px system-ui, sans-serif",i.fillText(`Player: ${e.username} • Account Level ${e.accountLevel}`,300,735);const n=a.toDataURL("image/png"),o=document.createElement("a");o.download=`riftbound_victory_${Date.now()}.png`,o.href=n,o.click(),d.playCrystalHarvest(),h.showToast("Victory Card Saved! 📸")}}class A{canvas;ctx;particles;input;combat;loop;currentRoom=null;hero;attackTimer=0;bossRageTimer=0;constructor(){this.canvas=document.getElementById("game-canvas"),this.ctx=this.canvas.getContext("2d"),this.particles=new x(800),this.input=new b(this.canvas),this.combat=new k,this.hero={id:"hero_blaze",name:"Blaze",x:300,y:400,vx:0,vy:0,radius:18,maxHp:600,hp:600,speed:180,iFrameTimer:0,dashCooldown:0,skill1Cooldown:0,skill2Cooldown:0,primaryElement:"PYRO",secondaryElement:"GALE",weaponTier:1,comboCount:0,comboTimer:0,skill1Name:"Wind Whirlwind",skill2Name:"Fire Blast"},this.handleResize(),window.addEventListener("resize",()=>this.handleResize()),this.loop=new y(e=>this.update(e),()=>this.render()),this.init()}async init(){await v.autoLoginGuest(),l.subscribe(()=>{h.renderTopBar(),h.renderNavigation(),L.renderCurrentScreen(()=>this.startRiftCombat()),this.updateHUD()}),this.loop.start()}handleResize(){const e=window.devicePixelRatio||1;this.canvas.width=window.innerWidth*e,this.canvas.height=window.innerHeight*e,this.ctx.scale(e,e)}startRiftCombat(){const e=l.getState(),t=e.heroes.find(i=>i.id===e.activeHeroId)||e.heroes[0],a=e.skillPointsAllocated[t.id]||{health:0};this.hero.id=t.id,this.hero.name=t.name,this.hero.maxHp=t.baseHp+a.health*60,this.hero.hp=this.hero.maxHp,this.hero.speed=t.baseSpeed,this.hero.primaryElement=t.primaryElement,this.hero.secondaryElement=t.secondaryElement,this.hero.skill1Name=t.skill1Name,this.hero.skill2Name=t.skill2Name,this.hero.weaponTier=e.equippedWeapon.tier,this.hero.x=window.innerWidth/2,this.hero.y=window.innerHeight/2+100,this.currentRoom=E.generateRoom(e.currentFloor,window.innerWidth,window.innerHeight),l.setState({screen:"RIFT_COMBAT"}),d.playLevelUp(),h.showToast(`Floor ${e.currentFloor}: Battle Start!`)}update(e){const t=l.getState();if(this.particles.update(e),t.screen!=="RIFT_COMBAT"||!this.currentRoom)return;if(this.input.moveVector.isMoving&&(this.hero.x+=this.input.moveVector.x*this.hero.speed*e,this.hero.y+=this.input.moveVector.y*this.hero.speed*e,Math.random()<.2&&this.particles.emit(this.hero.x,this.hero.y+12,1,"#00f0ff",.5,2)),this.hero.x=Math.max(30,Math.min(window.innerWidth-30,this.hero.x)),this.hero.y=Math.max(70,Math.min(window.innerHeight-70,this.hero.y)),this.hero.iFrameTimer>0&&(this.hero.iFrameTimer-=e),this.hero.dashCooldown>0&&(this.hero.dashCooldown-=e),this.hero.skill1Cooldown>0&&(this.hero.skill1Cooldown-=e),this.hero.skill2Cooldown>0&&(this.hero.skill2Cooldown-=e),this.hero.comboTimer>0&&(this.hero.comboTimer-=e,this.hero.comboTimer<=0&&(this.hero.comboCount=0)),this.input.consumeDash()&&this.hero.dashCooldown<=0){this.hero.dashCooldown=1.1,this.hero.iFrameTimer=.3;const i=this.input.moveVector.isMoving?Math.atan2(this.input.moveVector.y,this.input.moveVector.x):0;this.hero.x+=Math.cos(i)*120,this.hero.y+=Math.sin(i)*120,this.particles.emit(this.hero.x,this.hero.y,22,"#00f0ff",4.5,3),d.playSlash()}if(this.attackTimer+=e,this.attackTimer>=.32){this.attackTimer=0;const i=this.findNearestEnemy();if(i){const s=Math.atan2(i.y-this.hero.y,i.x-this.hero.x),n=50+(this.hero.weaponTier-1)*16;let o="#00f0ff";this.hero.primaryElement==="PYRO"&&(o="#ff5500"),this.hero.primaryElement==="VOLT"&&(o="#ffd600"),this.hero.primaryElement==="CRYO"&&(o="#76ffff"),this.hero.primaryElement==="VOID"&&(o="#a855f7"),this.combat.spawnProjectile(this.hero.x,this.hero.y,s,440,n,this.hero.primaryElement,!0,o),d.playSlash()}}if(this.input.consumeSkill1()&&this.hero.skill1Cooldown<=0){this.hero.skill1Cooldown=3.6,d.playResonanceDetonation(),this.particles.triggerShake(8);for(let i=0;i<8;i++){const s=i/8*Math.PI*2;this.combat.spawnProjectile(this.hero.x,this.hero.y,s,320,65,this.hero.secondaryElement,!0,"#76ffff",8,2)}}if(this.input.consumeSkill2()&&this.hero.skill2Cooldown<=0){this.hero.skill2Cooldown=5.5,d.playResonanceDetonation(),this.particles.triggerShake(14);for(let i=0;i<14;i++){const s=i/14*Math.PI*2;this.combat.spawnProjectile(this.hero.x,this.hero.y,s,290,95,this.hero.primaryElement,!0,"#ffd600",10,3)}}for(const i of this.currentRoom.enemies){if(i.isDead)continue;i.elementTimer>0&&(i.elementTimer-=e,i.elementTimer<=0&&(i.appliedElement=null));const s=this.hero.x-i.x,n=this.hero.y-i.y,o=Math.sqrt(s*s+n*n);if(o>i.radius+this.hero.radius+5&&(i.x+=s/o*i.speed*e,i.y+=n/o*i.speed*e),i.type==="RIFT_GUARDIAN_BOSS"&&i.hp<i.maxHp*.5&&(this.bossRageTimer+=e,this.bossRageTimer>.38)){this.bossRageTimer=0;const r=Date.now()/200%(Math.PI*2);this.combat.spawnProjectile(i.x,i.y,r,200,25,"VOID",!1,"#ef4444",7),this.combat.spawnProjectile(i.x,i.y,r+Math.PI,200,25,"VOID",!1,"#ef4444",7)}i.attackCooldown-=e,i.attackCooldown<=0&&o<i.telegraphRadius+20&&(i.attackCooldown=1.8,this.combat.hitHero(this.hero,35,this.particles))}this.combat.updateProjectiles(e,this.currentRoom.enemies,this.hero,this.particles),this.currentRoom.enemies.filter(i=>!i.isDead).length===0&&!this.currentRoom.isCleared&&(this.currentRoom.isCleared=!0,d.playLevelUp(),h.showToast("ROOM CLEARED! Choose a Portal")),this.hero.hp<=0&&(h.showToast("Hero Down! Returning to Base."),l.setState({screen:"EXTRACTION_SUMMARY",currentRunScore:this.combat.totalDamageDealt,pendingCrystals:150,pendingVoidShards:0})),this.updateHUD()}findNearestEnemy(){if(!this.currentRoom)return null;let e=null,t=420;for(const a of this.currentRoom.enemies)if(!a.isDead){const i=Math.hypot(a.x-this.hero.x,a.y-this.hero.y);i<t&&(t=i,e=a)}return e}updateHUD(){const e=document.getElementById("hud-container");if(!e)return;const t=l.getState();if(t.screen!=="RIFT_COMBAT"){e.innerHTML="";return}const a=Math.round(this.hero.hp/this.hero.maxHp*100),i=Math.max(0,this.hero.skill1Cooldown).toFixed(1),s=Math.max(0,this.hero.skill2Cooldown).toFixed(1);e.innerHTML=`
      <div class="status-bars">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #00f0ff;">
          <span>${this.hero.name} (Lv. ${t.accountLevel})</span>
          <span>HP: ${this.hero.hp}/${this.hero.maxHp}</span>
        </div>
        <div class="bar-container">
          <div class="hp-fill" style="width: ${a}%;"></div>
        </div>
        ${this.hero.comboCount>2?`
          <div style="font-size: 13px; font-weight: 900; color: #ffd600; text-shadow: 0 0 8px rgba(255,214,0,0.6);">
            🔥 ${this.hero.comboCount}x COMBO!
          </div>
        `:""}
      </div>

      <div class="combat-hud interactive">
        <button class="skill-btn" id="btn-skill-1" style="border-color: #76ffff;" title="Tap to trigger Element Combo">
          <span>🌀 ${this.hero.skill1Name.split(" ")[0]}</span>
          <span>${this.hero.skill1Cooldown>0?i+"s":"READY"}</span>
        </button>
        <button class="skill-btn" id="btn-skill-2" style="border-color: #ffd600;" title="Ultimate Attack">
          <span>⚡ ${this.hero.skill2Name.split(" ")[0]}</span>
          <span>${this.hero.skill2Cooldown>0?s+"s":"READY"}</span>
        </button>
        <button class="skill-btn" id="btn-dash" style="border-color: #00f0ff;" title="Dodge Danger">
          <span>⚡ Dodge</span>
        </button>
      </div>
    `,document.getElementById("btn-skill-1")?.addEventListener("click",()=>{this.input.isSkill1Triggered=!0}),document.getElementById("btn-skill-2")?.addEventListener("click",()=>{this.input.isSkill2Triggered=!0}),document.getElementById("btn-dash")?.addEventListener("click",()=>{this.input.isDashTriggered=!0})}render(){const e=window.innerWidth,t=window.innerHeight;if(this.ctx.save(),this.particles.screenShake>0){const s=(Math.random()-.5)*this.particles.screenShake,n=(Math.random()-.5)*this.particles.screenShake;this.ctx.translate(s,n)}this.ctx.fillStyle="#07090e",this.ctx.fillRect(0,0,e,t),this.ctx.strokeStyle="rgba(0, 240, 255, 0.08)",this.ctx.lineWidth=1;const a=40;for(let s=0;s<e;s+=a)this.ctx.beginPath(),this.ctx.moveTo(s,0),this.ctx.lineTo(s,t),this.ctx.stroke();for(let s=0;s<t;s+=a)this.ctx.beginPath(),this.ctx.moveTo(0,s),this.ctx.lineTo(e,s),this.ctx.stroke();const i=l.getState();if(i.screen==="RIFT_COMBAT"&&this.currentRoom){this.currentRoom.isCleared&&(this.ctx.fillStyle="rgba(16, 185, 129, 0.25)",this.ctx.strokeStyle="#10b981",this.ctx.lineWidth=3,this.ctx.beginPath(),this.ctx.arc(e/2-85,t/2-80,44,0,Math.PI*2),this.ctx.fill(),this.ctx.stroke(),this.ctx.fillStyle="#fff",this.ctx.font="bold 12px sans-serif",this.ctx.textAlign="center",this.ctx.fillText("SAFE EXIT",e/2-85,t/2-85),this.ctx.font="10px sans-serif",this.ctx.fillStyle="#10b981",this.ctx.fillText("Keep Loot",e/2-85,t/2-70),Math.hypot(this.hero.x-(e/2-85),this.hero.y-(t/2-80))<45&&l.setState({screen:"EXTRACTION_SUMMARY",currentRunScore:this.combat.totalDamageDealt+i.currentFloor*5e3,pendingCrystals:400+i.currentFloor*150,pendingVoidShards:20}),this.ctx.fillStyle="rgba(168, 85, 247, 0.25)",this.ctx.strokeStyle="#a855f7",this.ctx.beginPath(),this.ctx.arc(e/2+85,t/2-80,44,0,Math.PI*2),this.ctx.fill(),this.ctx.stroke(),this.ctx.fillStyle="#fff",this.ctx.font="bold 12px sans-serif",this.ctx.fillText("NEXT FLOOR",e/2+85,t/2-85),this.ctx.font="10px sans-serif",this.ctx.fillStyle="#c084fc",this.ctx.fillText("3x Loot!",e/2+85,t/2-70),Math.hypot(this.hero.x-(e/2+85),this.hero.y-(t/2-80))<45&&(l.setState({currentFloor:i.currentFloor+1}),this.startRiftCombat()));for(const s of this.currentRoom.enemies)if(!s.isDead){if(s.attackCooldown<.6&&(this.ctx.fillStyle="rgba(239, 68, 68, 0.25)",this.ctx.beginPath(),this.ctx.arc(s.x,s.y,s.telegraphRadius,0,Math.PI*2),this.ctx.fill()),this.ctx.fillStyle=s.color,this.ctx.beginPath(),this.ctx.arc(s.x,s.y,s.radius,0,Math.PI*2),this.ctx.fill(),s.appliedElement){let o="#ff5500";s.appliedElement==="CRYO"&&(o="#76ffff"),s.appliedElement==="VOLT"&&(o="#ffd600"),s.appliedElement==="VOID"&&(o="#a855f7"),this.ctx.strokeStyle=o,this.ctx.lineWidth=3,this.ctx.beginPath(),this.ctx.arc(s.x,s.y,s.radius+6,0,Math.PI*2),this.ctx.stroke()}const n=s.hp/s.maxHp;this.ctx.fillStyle="#333",this.ctx.fillRect(s.x-16,s.y-s.radius-10,32,4),this.ctx.fillStyle="#ef4444",this.ctx.fillRect(s.x-16,s.y-s.radius-10,32*n,4)}for(const s of this.combat.projectiles)s.active&&(this.ctx.fillStyle=s.color,this.ctx.shadowColor=s.color,this.ctx.shadowBlur=8,this.ctx.beginPath(),this.ctx.arc(s.x,s.y,s.radius,0,Math.PI*2),this.ctx.fill(),this.ctx.shadowBlur=0);this.ctx.save(),this.hero.iFrameTimer>0&&Math.floor(Date.now()/60)%2===0&&(this.ctx.globalAlpha=.4),this.ctx.fillStyle="#00f0ff",this.ctx.shadowColor="#00f0ff",this.ctx.shadowBlur=14,this.ctx.beginPath(),this.ctx.arc(this.hero.x,this.hero.y,this.hero.radius,0,Math.PI*2),this.ctx.fill(),this.ctx.restore()}this.particles.render(this.ctx),this.ctx.restore()}}window.addEventListener("DOMContentLoaded",()=>{new A});
