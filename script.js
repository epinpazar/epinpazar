const PRODUCTS=[
  {title:'Valorant VP 1250',price:129,img:'https://via.placeholder.com/300x200'},
  {title:'Steam Cüzdan 50 TL',price:49,img:'https://via.placeholder.com/300x200'},
  {title:'Netflix Premium',price:70,img:'https://via.placeholder.com/300x200'}
];

const wrap=document.getElementById('products');

PRODUCTS.forEach(p=>{
  const c=document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <img src="${p.img}" style="width:100%;border-radius:8px">
    <h3>${p.title}</h3>
    <p>${p.price} TL</p>
    <button class="btn">Sepete Ekle</button>
  `;
  wrap.appendChild(c);
});
