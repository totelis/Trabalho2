// script.js - frontend behaviors (demo)
const API_BASE = 'http://localhost:3001'; // backend expected

const catalog = [
  {id:'amanhecer_sangrento', title:'Amanhecer Sangrento', genre:'Ação, Terror', file:'assets/filmes/amanhecer_sangrento.jpg', desc:'Um horror pós-apocalíptico de tirar o fôlego.'},
  {id:'galaxia_perdida', title:'Galáxia Perdida', genre:'Ficção Científica', file:'assets/filmes/galaxia_perdida.jpg', desc:'Uma expedição que dobra o tempo e a esperança.'},
  {id:'sombras_do_passado', title:'Sombras do Passado', genre:'Mistério, Drama', file:'assets/filmes/sombras_do_passado.jpg', desc:'Segredos antigos retornam em uma cidade esquecida.'},
  {id:'amor_em_paris', title:'Amor em Paris', genre:'Romance', file:'assets/filmes/amor_em_paris.jpg', desc:'Uma história doce e improvável entre dois mundos.'},
  {id:'cacada_virtual', title:'Caçada Virtual', genre:'Suspense', file:'assets/filmes/caçada_virtual.jpg', desc:'Hackers, caçadores e um jogo que virou realidade.'},
  {id:'o_ultimo_guardiao', title:'O Último Guardião', genre:'Fantasia', file:'assets/filmes/o_ultimo_guardiao.jpg', desc:'Um guardião solitário protege o último portal.'},
  {id:'ecos_do_abismo', title:'Ecos do Abismo', genre:'Horror', file:'assets/filmes/ecos_do_abismo.jpg', desc:'Uma equipe investiga ruínas que sussurram ao coração.'},
  {id:'reinos_em_ruinas', title:'Reinos em Ruínas', genre:'Épico', file:'assets/filmes/reinos_em_ruinas.jpg', desc:'Guerra, lealdade e o preço do trono.'},
  {id:'codigo_invisivel', title:'Código Invisível', genre:'Thriller', file:'assets/filmes/codigo_invisivel.jpg', desc:'Algoritmos que decidem destinos humanos.'},
  {id:'destino_solar', title:'Destino Solar', genre:'Ficção Científica, Aventura', file:'assets/filmes/destino_solar.jpg', desc:'Corrida contra o tempo em órbita do Sol.'},
];

function el(q){return document.querySelector(q)}
function elAll(q){return document.querySelectorAll(q)}

function populateHighlights(){
  const grid = el('#grid-highlights');
  if(!grid) return;
  grid.innerHTML = '';
  catalog.slice(0,6).forEach(m=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<a href="filme.html?id=${m.id}"><img src="${m.file}" alt="${m.title}"><div class="meta"><h4>${m.title}</h4><p class="muted">${m.genre}</p></div></a>`;
    grid.appendChild(card);
  });
}

function populateCatalog(){
  const grid = el('#catalog-grid');
  if(!grid) return;
  grid.innerHTML='';
  catalog.forEach(m=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<a href="filme.html?id=${m.id}"><img src="${m.file}" alt="${m.title}"><div class="meta"><h4>${m.title}</h4><p class="muted">${m.genre}</p></div></a>`;
    grid.appendChild(card);
  });
}

function loadFilmPage(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return;
  const movie = catalog.find(x=>x.id===id);
  if(!movie) return;
  const poster = el('#film-poster'); const title = el('#film-title'); const genre = el('#film-genre'); const desc = el('#film-desc');
  if(poster) poster.src = movie.file;
  if(title) title.textContent = movie.title;
  if(genre) genre.textContent = movie.genre;
  if(desc) desc.textContent = movie.desc;
}

function initAuthUI(){
  const acct = JSON.parse(localStorage.getItem('cineflix_user') || '{}');
  const acctEmail = el('#acct-email'); const acctStatus = el('#acct-status');
  if(acct && acct.email){ if(acctEmail) acctEmail.textContent = acct.email; acctStatus.textContent = acct.verified ? 'Verificado' : 'Não verificado'; }
  const logout = el('#logout'); if(logout) logout.addEventListener('click', ()=>{ localStorage.removeItem('cineflix_user'); location.href='index.html'; });
}

document.addEventListener('DOMContentLoaded', ()=>{
  populateHighlights();
  populateCatalog();
  loadFilmPage();
  initAuthUI();

  const start = el('#start'); const emailMain = el('#email-main');
  const modal = el('#modal'); const closeModal = el('#close-modal');
  const signupForm = el('#signup-form'); const signupEmail = el('#signup-email'); const signupPwd = el('#signup-password');
  const signupMsg = el('#signup-msg'); const confirmArea = el('#confirm-area'); const confirmBtn = el('#confirm-btn'); const confirmCode = el('#confirm-code'); const confirmMsg = el('#confirm-msg');

  if(start){
    start.addEventListener('click', ()=>{
      const email = emailMain.value.trim();
      if(!email){ alert('Digite um e-mail válido'); return; }
      modal.classList.remove('hidden'); signupEmail.value = email;
    });
  }
  if(closeModal) closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));

  if(signupForm){
    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = signupEmail.value.trim(); const pwd = signupPwd.value;
      signupMsg.textContent='';
      if(!email || pwd.length<6){ signupMsg.textContent='Dados inválidos'; return; }
      try{
        const resp = await fetch(API_BASE + '/api/signup', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pwd})});
        const data = await resp.json();
        if(!resp.ok){ signupMsg.textContent = data.error || 'Erro'; return; }
        signupMsg.textContent = data.message || 'Código enviado por e-mail.';
        confirmArea.classList.remove('hidden');
      }catch(err){ signupMsg.textContent='Falha de rede'; console.error(err); }
    });
  }

  if(confirmBtn){
    confirmBtn.addEventListener('click', async ()=>{
      const code = confirmCode.value.trim(); const email = signupEmail.value.trim();
      try{
        const resp = await fetch(API_BASE + '/api/verify', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,code})});
        const data = await resp.json();
        if(!resp.ok){ confirmMsg.textContent = data.error || 'Erro'; return; }
        confirmMsg.textContent = data.message || 'Confirmado';
        localStorage.setItem('cineflix_user', JSON.stringify({email, verified: true}));
        setTimeout(()=>{ modal.classList.add('hidden'); location.href='home.html'; }, 800);
      }catch(err){ confirmMsg.textContent='Erro de rede'; console.error(err); }
    });
  }

  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const em = document.getElementById('login-email').value; const pw = document.getElementById('login-pwd').value;
      const user = JSON.parse(localStorage.getItem('cineflix_user') || '{}');
      if(user.email===em){ location.href='home.html'; } else { document.getElementById('login-msg').textContent='Usuário não encontrado (demo)'; }
    });
  }
});
