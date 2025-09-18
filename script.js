
/* Gamification logic: XP, levels, badges saved in localStorage */
const XP_KEY = 'sansita_xp_state_v1'

const defaultState = {
  xp: 0,
  level: 1,
  badges: {
    hack: false,
    google: false,
    iste: false,
    project: false
  },
  quests: {
    be: false,
    hmr: false,
    dps: false
  }
}

function saveState(s){ localStorage.setItem(XP_KEY, JSON.stringify(s)) }
function loadState(){ try{ return JSON.parse(localStorage.getItem(XP_KEY)) || defaultState }catch(e){return defaultState} }

let state = loadState()

const xpEl = document.getElementById('xp')
const levelEl = document.getElementById('level')
const xpMaxEl = document.getElementById('xp-max')
const xpFill = document.getElementById('xp-fill')
const xpBar = document.getElementById('xp-bar')

const XP_PER_LEVEL = 200

function render(){
  xpEl.textContent = state.xp
  levelEl.textContent = state.level
  xpMaxEl.textContent = XP_PER_LEVEL
  const pct = Math.min(100, (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100)
  xpFill.style.width = pct + '%'
  // badges
  document.getElementById('badge-hack').classList.toggle('unlocked', state.badges.hack)
  document.getElementById('badge-google').classList.toggle('unlocked', state.badges.google)
  document.getElementById('badge-iste').classList.toggle('unlocked', state.badges.iste)
  // update based on quests
  document.querySelectorAll('.claim').forEach(b=>{
    const parent = b.closest('.quest') || b.closest('.project-card')
    if(parent){
      // disable if claimed via state
      const xp = parseInt(b.dataset.xp||0,10)
      // map button to state by text
      if(parent.querySelector('.q-title')){
        const t = parent.querySelector('.q-title').textContent.toLowerCase()
        if(t.includes('be-cse') && state.quests.be) disableButton(b)
        if(t.includes('hmr') && state.quests.hmr) disableButton(b)
        if(t.includes('dps') && state.quests.dps) disableButton(b)
      } else {
        // project button maps to project badge
        if(state.badges.project) disableButton(b)
      }
    }
  })
  saveState(state)
}

function disableButton(b){
  b.disabled = true
  b.textContent = 'Completed'
  b.style.opacity = '0.7'
  b.style.cursor = 'default'
}

function addXp(amount){
  state.xp += amount
  while(state.xp > state.level * XP_PER_LEVEL){
    state.level += 1
  }
  render()
  // small celebration
  confettiBurst()
}

function confettiBurst(){
  // lightweight confetti effect using small DOM elements
  const root = document.createElement('div')
  root.style.position='fixed'; root.style.left='50%'; root.style.top='20%'; root.style.pointerEvents='none'; root.style.zIndex=9999
  for(let i=0;i<18;i++){
    const p = document.createElement('span')
    p.textContent = '★'
    p.style.position='absolute'; p.style.transform = 'translate(-50%,-50%) rotate('+(Math.random()*360)+'deg)'
    p.style.left = (Math.random()*120 - 10) + '%'; p.style.top = (Math.random()*40) + '%'
    p.style.fontSize = (8 + Math.random()*16)+'px'; p.style.opacity = '0.9'
    p.style.transition = 'all 900ms ease-out'
    p.style.color = ['#3b82f6','#1e3a8a','#8b5e3c'][i%3]
    root.appendChild(p)
    setTimeout(()=>{ p.style.top = (Math.random()*40 + 40) + '%'; p.style.opacity = '0'; p.style.transform += ' translateY(40px) scale(1.2)'; },20)
  }
  document.body.appendChild(root)
  setTimeout(()=>root.remove(),1200)
}

// badge clicks
document.getElementById('badge-hack').addEventListener('click',()=>{
  if(state.badges.hack) return
  state.badges.hack = true; addXp( parseInt(document.getElementById('badge-hack').dataset.xp,10) )
  render()
})
document.getElementById('badge-google').addEventListener('click',()=>{
  if(state.badges.google) return
  state.badges.google = true; addXp( parseInt(document.getElementById('badge-google').dataset.xp,10) )
  render()
})
document.getElementById('badge-iste').addEventListener('click',()=>{
  if(state.badges.iste) return
  state.badges.iste = true; addXp( parseInt(document.getElementById('badge-iste').dataset.xp,10) )
  render()
})

// project claim button
document.querySelectorAll('.claim').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const xp = parseInt(btn.dataset.xp||0,10)
    // mark quests/project in state
    const parent = btn.closest('.quest')
    if(parent){
      const t = parent.querySelector('.q-title').textContent.toLowerCase()
      if(t.includes('be-cse')) state.quests.be = true
      if(t.includes('hmr international')) state.quests.hmr = true
      if(t.includes('dps - bengaluru')) state.quests.dps = true
    } else {
      state.badges.project = true
    }
    addXp(xp)
    disableButton(btn)
    render()
  })
})

document.getElementById('claim-all').addEventListener('click', ()=>{
  const badges = document.querySelectorAll('.badge')
  badges.forEach(b=> b.click() )
  document.querySelectorAll('.claim').forEach(btn => { if(!btn.disabled) btn.click() })
  render()
})

// initialization
render()

// keyboard shortcut: press 'L' to reset local progress (for testing)
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='r' && (e.ctrlKey||e.metaKey)){
    if(confirm('Reset local progress?')){
      localStorage.removeItem(XP_KEY); state = loadState(); render()
    }
  }
})
