
/*
  epinpazar - Professional frontend demo
  - localStorage used as a demo "database"
  - Admin modal provides product CRUD + import/export
  - Checkout simulates payment and auto-delivers codes from product.codes
*/

const ADMIN_PASSWORD = 'admin123'; // change via code if needed
const PAGE_SIZE = 9;

// sample products
const SAMPLE = [
  {id:1,title:'Valorant 1250 VP',cat:'game',price:129.90,thumb:'https://via.placeholder.com/600x360?text=Valorant+VP',type:'manual',codes:[]},
  {id:2,title:'Steam Cüzdan 50₺',cat:'epin',price:54.90,thumb:'https://via.placeholder.com/600x360?text=Steam+50',type:'code',codes:['STEAM-ABC-001','STEAM-ABC-002','STEAM-ABC-003']},
  {id:3,title:'Netflix Premium (Profil)',cat:'dijital',price:69.90,thumb:'https://via.placeholder.com/600x360?text=Netflix',type:'manual',codes:[]},
  {id:4,title:'LoL 2400 RP',cat:'game',price:219.90,thumb:'https://via.placeholder.com/600x360?text=LoL+2400+RP',type:'manual',codes:[]},
  {id:5,title:'Google Play Kod 100₺',cat:'epin',price:109.90,thumb:'https://via.placeholder.com/600x360?text=Google+Play+100',type:'code',codes:['GP-100-AAA','GP-100-BBB']},
  {id:6,title:'PUBG Mobile UC',cat:'game',price:179.90,thumb:'https://via.placeholder.com/600x360?text=PUBG+UC',type:'manual',codes:[]},
  {id:7,title:'Discord Nitro Kod',cat:'epin',price:29.90,thumb:'https://via.placeholder.com/600x360?text=Discord+Nitro',type:'code',codes:['NITRO-1','NITRO-2']},
  {id:8,title:'Genshin Primogem Paketi',cat:'game',price:99.90,thumb:'https://via.placeholder.com/600x360?text=Genshin',type:'manual',codes:[]},
  {id:9,title:'ChatGPT Plus 1 Ay',cat:'dijital',price:54.90,thumb:'https://via.placeholder.com/600x360?text=ChatGPT+Plus',type:'code',codes:['GPT-PLUS-001']},
  {id:10,title:'Riot Gift Card 100 TL',cat:'epin',price:99.90,thumb:'https://via.placeholder.com/600x360?text=Riot+100',type:'code',codes:['RIOT-100-AA']},
];

// storage helpers
function getProducts(){
  try{
    const raw = localStorage.getItem('ep_products');
    if(!raw){ localStorage.setItem('ep_products', JSON.stringify(SAMPLE)); return SAMPLE.slice(); }
    return JSON.parse(raw);
  }catch(e){ localStorage.setItem('ep_products', JSON.stringify(SAMPLE)); return SAMPLE.slice(); }
}
function saveProducts(arr){ localStorage.setItem('ep_products', JSON.stringify(arr)); }
function resetProducts(){ localStorage.removeItem('ep_products'); location.reload(); }

// cart
let cart = JSON.parse(localStorage.getItem('ep_cart')||'[]');

// state
let state = {q:'',cat:'all',autoOnly:false,manualOnly:false,sort:'pop',page:1};

// init
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('searchInput').addEventListener('input', ()=>{state.q=document.getElementById('searchInput').value; state.page=1; renderProducts();});
  document.getElementById('autoOnly').addEventListener('change', ()=>{state.autoOnly=document.getElementById('autoOnly').checked; renderProducts();});
  document.getElementById('manualOnly').addEventListener('change', ()=>{state.manualOnly=document.getElementById('manualOnly').checked; renderProducts();});
  document.getElementById('sortBy').addEventListener('change', ()=>{state.sort=document.getElementById('sortBy').value; renderProducts();});
  document.getElementById('cartOpenBtn').addEventListener('click', openCart);
  renderProducts(); renderCart(); renderCategories(); renderAdminList();
});

// render categories
function renderCategories(){
  const cats = ['all','game','epin','account','dijital'];
  const names = {'all':'Tümü','game':'Oyun Itemleri','epin':'E‑Pin / Kod','account':'Hesaplar','dijital':'Dijital Servisler'};
  const ul = document.getElementById('categoryList'); ul.innerHTML='';
  cats.forEach(c=>{
    const li = document.createElement('li'); li.innerHTML = `<button class="cat-btn" onclick="setCat('${c}')">${names[c]}</button>`; ul.appendChild(li);
  });
}
function setCat(c){ state.cat=c; state.page=1; renderProducts(); }

// products rendering with pagination
function renderProducts(){
  const products = getProducts();
  let list = products.filter(p=>{
    if(state.cat!=='all' && p.cat!==state.cat) return false;
    if(state.q && !p.title.toLowerCase().includes(state.q.toLowerCase())) return false;
    if(state.autoOnly && p.type!=='code') return false;
    if(state.manualOnly && p.type!=='manual') return false;
    return true;
  });
  if(state.sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if(state.page>pages) state.page=pages;
  const start = (state.page-1)*PAGE_SIZE;
  const pageItems = list.slice(start,start+PAGE_SIZE);

  document.getElementById('resultCount').innerText = total + ' ürün';
  const grid = document.getElementById('productGrid'); grid.innerHTML='';
  pageItems.forEach(p=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<img src="${p.thumb}" alt="${p.title}"><div class="title">${p.title}</div><div class="meta"><div class="price">₺${p.price.toFixed(2)}</div><div class="badge">${p.type==='code'?'Otomatik':'Manual'}</div></div><div style="margin-top:auto"><button class="btn btn-primary" onclick="openProduct(${p.id})">İncele & Satın Al</button></div>`;
    grid.appendChild(el);
  });

  // pagination
  const pag = document.getElementById('pagination'); pag.innerHTML='';
  for(let i=1;i<=pages;i++){
    const b = document.createElement('button'); b.textContent = i; b.className='icon-btn';
    if(i===state.page) b.style.fontWeight='700';
    b.onclick = ()=>{ state.page=i; renderProducts(); };
    pag.appendChild(b);
  }
}

// product detail / add to cart
function openProduct(id){
  const p = getProducts().find(x=>x.id===id); if(!p) return;
  const modal = document.getElementById('productModal'); modal.style.display='flex';
  const detail = document.getElementById('productDetail');
  detail.innerHTML = `<div style="display:flex;gap:18px"><img src="${p.thumb}" style="width:360px;height:220px;object-fit:cover;border-radius:8px"/><div><h2>${p.title}</h2><div class="muted">${p.cat} • ${p.type}</div><p style="font-size:20px;color:var(--accent)">₺${p.price.toFixed(2)}</p><p>${p.type==='code'?'Bu ürün satın alındığında listeden otomatik kod teslim edilecektir.':'Manuel teslimat: sipariş sonrası bilgiler panelden verilecektir.'}</p><div style="margin-top:10px"><button class="btn btn-primary" onclick="addToCart(${p.id})">Sepete Ekle</button> <button class="btn" onclick="buyNow(${p.id})">Hemen Satın Al</button></div></div></div>`;
}
function closeProductModal(){ document.getElementById('productModal').style.display='none'; }

function addToCart(id){
  const prod = getProducts().find(p=>p.id===id); if(!prod) return;
  const exists = cart.find(c=>c.id===id);
  if(exists) exists.qty++; else cart.push({id:prod.id,title:prod.title,price:prod.price,qty:1});
  localStorage.setItem('ep_cart', JSON.stringify(cart));
  renderCart();
  alert(prod.title + ' sepete eklendi');
}
function buyNow(id){ addToCart(id); openCart(); }

// cart
function renderCart(){
  const wrap = document.getElementById('cartItems'); wrap.innerHTML='';
  let total = 0;
  cart.forEach(it=>{
    const row = document.createElement('div'); row.className='cart-row'; row.innerHTML = `<div>${it.title} x${it.qty}</div><div>₺${(it.price*it.qty).toFixed(2)}</div>`;
    wrap.appendChild(row);
    total += it.price*it.qty;
  });
  document.getElementById('cartTotal').innerText = '₺'+total.toFixed(2);
  document.getElementById('cartCount').innerText = cart.reduce((s,i)=>s+i.qty,0);
}
function openCart(){ document.getElementById('cartDrawer').style.display='block'; }
function closeCart(){ document.getElementById('cartDrawer').style.display='none'; }

function checkout(){
  if(cart.length===0){ alert('Sepet boş'); return; }
  const email = document.getElementById('buyerEmail').value.trim();
  if(!email || !email.includes('@')){ if(!confirm('E-posta girilmedi - yine de devam edilsin mi?')) return; }
  // process order: deliver codes where possible
  const products = getProducts();
  const deliveries = [];
  cart.forEach(it=>{
    const p = products.find(x=>x.id===it.id);
    if(p.type==='code'){
      const codesGiven = [];
      for(let i=0;i<it.qty;i++){
        if(p.codes && p.codes.length>0) codesGiven.push(p.codes.shift());
        else codesGiven.push('(Kod mevcut değil)');
      }
      deliveries.push({title:p.title, type:'code', codes:codesGiven});
    } else {
      deliveries.push({title:p.title, type:'manual', note:'Manuel teslimat gerçekleştirilecek.'});
    }
  });
  // save updated products
  saveProducts(products);
  // clear cart
  cart = []; localStorage.removeItem('ep_cart'); renderCart(); renderProducts();
  // show summary
  let msg = 'Sipariş tamamlandı — Teslimatlar:\n\n';
  deliveries.forEach(d=>{
    if(d.type==='code') msg += d.title + ' — Kodlar: ' + d.codes.join(', ') + '\n\n';
    else msg += d.title + ' — ' + d.note + '\n\n';
  });
  alert(msg + '\nE-posta: ' + (email || 'yok') + '\n(Demo ödeme)');
}

// product admin
function openAdminModal(){ document.getElementById('adminModal').style.display='flex'; }
function closeAdminModal(){ document.getElementById('adminModal').style.display='none'; }

function adminLogin(){
  const pass = document.getElementById('adminPass').value;
  if(pass !== ADMIN_PASSWORD){ document.getElementById('adminNotice').innerText='Yanlış parola'; return; }
  document.getElementById('adminNotice').innerText='Admin giriş başarılı — ürün ekleyebilirsiniz.';
}

// save product (create)
function saveProduct(){
  const pass = document.getElementById('adminPass').value;
  if(pass !== ADMIN_PASSWORD){ alert('Önce admin olarak giriş yap'); return; }
  const title = document.getElementById('pTitle').value.trim(); if(!title){ alert('Başlık gir'); return; }
  const cat = document.getElementById('pCat').value;
  const price = parseFloat(document.getElementById('pPrice').value) || 0;
  const type = document.getElementById('pType').value;
  const thumb = document.getElementById('pThumb').value || 'https://via.placeholder.com/600x360?text=Ürün';
  const codes = (document.getElementById('pCodes').value || '').split('\n').map(s=>s.trim()).filter(Boolean);
  const products = getProducts();
  const id = products.length ? Math.max(...products.map(p=>p.id))+1 : 1;
  products.push({id,title,cat,price,thumb,type,codes});
  saveProducts(products); renderProducts(); renderAdminList(); alert('Ürün eklendi (demo)'); 
  // clear form
  document.getElementById('pTitle').value=''; document.getElementById('pPrice').value=''; document.getElementById('pCodes').value='';
}

// admin list / edit / delete
function renderAdminList(){
  const products = getProducts();
  const wrap = document.getElementById('adminList'); wrap.innerHTML='';
  products.forEach(p=>{
    const el = document.createElement('div'); el.className='admin-item';
    el.innerHTML = `<div><strong>${p.title}</strong><div class="muted">${p.cat} • ${p.type} • ₺${p.price.toFixed(2)}</div></div>
    <div><button class="btn" onclick='editProduct(${p.id})'>Düzenle</button> <button class="btn" onclick='deleteProduct(${p.id})'>Sil</button></div>`;
    wrap.appendChild(el);
  });
}
function editProduct(id){
  const products = getProducts();
  const p = products.find(x=>x.id===id); if(!p) return;
  document.getElementById('pTitle').value = p.title; document.getElementById('pCat').value = p.cat;
  document.getElementById('pPrice').value = p.price; document.getElementById('pType').value = p.type;
  document.getElementById('pThumb').value = p.thumb; document.getElementById('pCodes').value = (p.codes||[]).join('\n');
  window.scrollTo({top:document.getElementById('adminModal').offsetTop,behavior:'smooth'});
  // delete old
  deleteProduct(id);
}
function deleteProduct(id){
  if(!confirm('Ürünü silmek istediğine emin misin?')) return;
  let products = getProducts(); products = products.filter(p=>p.id!==id); saveProducts(products); renderProducts(); renderAdminList();
}

// import / export
function exportProducts(){
  const data = localStorage.getItem('ep_products') || '[]';
  const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'ep_products.json'; a.click(); URL.revokeObjectURL(url);
}
function importProducts(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader(); reader.onload = (evt)=>{ try{ const parsed = JSON.parse(evt.target.result); saveProducts(parsed); renderProducts(); renderAdminList(); alert('İçe aktarıldı'); }catch(err){ alert('Geçersiz JSON') } }; reader.readAsText(file);
}

// utilities
function scrollToCatalog(){ document.getElementById('catalog').scrollIntoView({behavior:'smooth'}); }
function openProduct(id){ window.openProduct && window.openProduct(id); } // legacy
function closeProductModal(){ document.getElementById('productModal').style.display='none'; }

// initial render
renderProducts(); renderCart(); renderAdminList();
