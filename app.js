(() => {
  'use strict';
  let catalogue;
  let lightbox;
  let opener;
  const selected = new Map();
  const root = document.querySelector('#catalogue');
  const viewer = document.querySelector('#viewer');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const specs = rows => `<dl class="spec-list">${rows.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;

  function productCard(product, position) {
    const first = product.variants[0];
    return `<article class="product-card" id="${product.id}" aria-labelledby="title-${product.id}">
      <div class="card-top"><h3 id="title-${product.id}">${escape(product.name)}</h3><span class="dimensions">${product.size} × ${product.size} cm</span></div>
      <div class="gallery" data-product="${product.id}">
        <button type="button" class="photo-open" aria-label="Agrandir ${escape(first.sku)}"><img class="main-photo" src="${first.image}" alt="${escape(product.name)} — ${escape(first.sku)}" width="${first.width}" height="${first.height}" ${position<2?'fetchpriority="high"':'loading="lazy"'} decoding="async"></button>
        <span class="image-counter">1 / ${product.variants.length}</span><span class="expand-indicator" aria-hidden="true">⤢</span>
        ${product.variants.length>1?'<button type="button" class="gallery-arrow prev" aria-label="Déclinaison précédente">←</button><button type="button" class="gallery-arrow next" aria-label="Déclinaison suivante">→</button>':''}
      </div>
      <div class="thumbs" role="group" aria-label="${escape(product.name)} — déclinaisons">${product.variants.map((variant,index)=>`<button type="button" class="thumbnail" data-index="${index}" aria-pressed="${index===0}" aria-label="Choisir ${escape(variant.sku)}" title="${escape(variant.sku)}"><img src="${variant.thumbnail}" width="48" height="48" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>
      <div class="sku-row"><code class="current-sku" aria-live="polite">${escape(first.sku)}</code><button type="button" class="copy-sku" aria-label="Copier le SKU ${escape(first.sku)}"><span aria-hidden="true">▣</span> Copier le SKU</button></div>
      <div class="card-body">
        <details class="card-detail"><summary>Description et caractéristiques</summary><p class="description">${escape(product.description)}</p>${specs(product.specs)}</details>
        <details class="card-detail"><summary>Emballage et accessoires</summary>${specs(product.packing)}</details>
        ${product.video?`<details class="card-detail video-detail"><summary><span class="play-icon" aria-hidden="true">▶</span> Voir la vidéo</summary><video controls muted playsinline preload="none" poster="${first.image}" data-src="${product.video}" aria-label="${escape(product.name)} en vidéo"></video></details>`:''}
      </div>
    </article>`;
  }

  function selectVariant(product, index, scrollThumb = true) {
    const next = (index + product.variants.length) % product.variants.length;
    selected.set(product.id, next);
    const variant = product.variants[next];
    const card = document.getElementById(product.id);
    const img = card.querySelector('.main-photo');
    img.src = variant.image;
    img.alt = `${product.name} — ${variant.sku}`;
    img.width = variant.width;
    img.height = variant.height;
    card.querySelector('.photo-open').setAttribute('aria-label', `Agrandir ${variant.sku}`);
    card.querySelector('.current-sku').textContent = variant.sku;
    card.querySelector('.copy-sku').setAttribute('aria-label', `Copier le SKU ${variant.sku}`);
    card.querySelector('.image-counter').textContent = `${next + 1} / ${product.variants.length}`;
    const buttons = card.querySelectorAll('.thumbnail');
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    if (scrollThumb) {
      const strip = card.querySelector('.thumbs');
      const button = buttons[next];
      strip.scrollTo({left:button.offsetLeft - strip.offsetLeft - strip.clientWidth/2 + button.clientWidth/2,behavior:'auto'});
    }
    if (lightbox?.id === product.id && viewer.open) updateViewer();
    return variant;
  }

  function updateViewer() {
    const product = lightbox;
    const index = selected.get(product.id) || 0;
    const variant = product.variants[index];
    document.querySelector('#viewer-product').textContent = `${product.name} · ${product.size} × ${product.size} cm`;
    document.querySelector('#viewer-title').textContent = variant.sku;
    const img = document.querySelector('#viewer-image');
    img.src = variant.image;
    img.alt = `${product.name} — ${variant.sku}`;
    document.querySelector('#viewer-position').textContent = `Déclinaison ${index + 1} / ${product.variants.length}`;
    viewer.querySelectorAll('.viewer-prev,.viewer-next').forEach(b => b.hidden = product.variants.length === 1);
  }

  function openViewer(product, trigger) {
    lightbox = product;
    opener = trigger;
    updateViewer();
    viewer.showModal();
    document.body.classList.add('scroll-locked');
    viewer.querySelector('.close-viewer').focus();
  }

  function bindProduct(product) {
    const card = document.getElementById(product.id);
    selected.set(product.id, 0);
    card.querySelectorAll('.thumbnail').forEach(button => button.addEventListener('click', () => selectVariant(product, Number(button.dataset.index))));
    card.querySelector('.prev')?.addEventListener('click', () => selectVariant(product, selected.get(product.id)-1));
    card.querySelector('.next')?.addEventListener('click', () => selectVariant(product, selected.get(product.id)+1));
    card.querySelector('.photo-open').addEventListener('click', event => openViewer(product, event.currentTarget));
    const gallery = card.querySelector('.gallery');
    let touch;
    gallery.addEventListener('touchstart', event => {touch=event.touches.length===1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY}:null;}, {passive:true});
    gallery.addEventListener('touchend', event => {
      if (!touch || !event.changedTouches[0]) return;
      const dx=event.changedTouches[0].clientX-touch.x;
      const dy=event.changedTouches[0].clientY-touch.y;
      if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.5) selectVariant(product,selected.get(product.id)+(dx<0?1:-1));
      touch=null;
    },{passive:true});
    card.querySelector('.copy-sku').addEventListener('click', async event => {
      const button=event.currentTarget;
      const sku=product.variants[selected.get(product.id)].sku;
      try {await navigator.clipboard.writeText(sku);button.textContent='Copié ✓';}
      catch {button.textContent='Sélectionnez le SKU';}
      setTimeout(()=>{button.innerHTML='<span aria-hidden="true">▣</span> Copier le SKU';},2000);
    });
    const video = card.querySelector('video');
    if (video) {
      video.muted=true;
      video.defaultMuted=true;
      card.querySelector('.video-detail').addEventListener('toggle',event=>{
        if (event.currentTarget.open) {
          if (!video.getAttribute('src')) {video.src=video.dataset.src;video.load();}
        } else video.pause();
      });
      video.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();}));
    }
  }

  function registerProductTool() {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const tool={
      name:'read_catalogue_products',title:'Read catalogue products',
      description:'Read product specifications, packaging and variant SKUs from this catalogue. Optionally match one or more exact SKUs.',
      inputSchema:{type:'object',properties:{skus:{type:'array',items:{type:'string'}}},additionalProperties:false},
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute(input) {
        if (!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>k!=='skus') || (input.skus!==undefined && (!Array.isArray(input.skus)||input.skus.some(s=>typeof s!=='string')))) throw new Error('Expected an object with an optional array of SKU strings.');
        const allSkus=new Set(catalogue.products.flatMap(p=>p.variants.map(v=>v.sku)));
        if (input.skus?.some(s=>!allSkus.has(s))) throw new Error('Unknown SKU. Use the exact reference shown in the catalogue.');
        return {products:catalogue.products.filter(p=>!input.skus?.length||p.variants.some(v=>input.skus.includes(v.sku))).map(p=>({name:p.name,sizeCm:p.size,description:p.description,specifications:p.specs,packing:p.packing,skus:p.variants.filter(v=>!input.skus?.length||input.skus.includes(v.sku)).map(v=>v.sku)}))};
      }
    };
    try {Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});} catch {}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }

  async function init() {
    try {
      const response=await fetch('catalogue.json');
      if(!response.ok)throw new Error('Catalogue indisponible');
      catalogue=await response.json();
      let position=0;
      root.innerHTML=['led','neon'].map(category=>{
        const products=catalogue.products.filter(p=>p.category===category);
        return `<section id="${category}" class="collection ${category==='neon'?'neon-collection':''}" aria-labelledby="heading-${category}"><div class="section-heading"><h2 id="heading-${category}">${category==='led'?'Croix LED':'Croix néon'}</h2><p>${products.length} produits · par taille</p></div><div class="products">${products.map(p=>productCard(p,position++)).join('')}</div></section>`;
      }).join('');
      catalogue.products.forEach(bindProduct);
      viewer.querySelector('.close-viewer').addEventListener('click',()=>viewer.close());
      viewer.addEventListener('close',()=>{document.body.classList.remove('scroll-locked');opener?.focus({preventScroll:true});lightbox=null;});
      viewer.addEventListener('click',event=>{if(event.target===viewer){const b=viewer.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)viewer.close();}});
      viewer.querySelector('.viewer-prev').addEventListener('click',()=>selectVariant(lightbox,selected.get(lightbox.id)-1));
      viewer.querySelector('.viewer-next').addEventListener('click',()=>selectVariant(lightbox,selected.get(lightbox.id)+1));
      viewer.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();selectVariant(lightbox,selected.get(lightbox.id)+(event.key==='ArrowLeft'?-1:1));}});
      document.querySelectorAll('.collection-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.collection-nav a').forEach(a=>a.classList.toggle('active',a===link));}));
      if ('IntersectionObserver' in window) {
        const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.collection-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-15% 0px -70% 0px',threshold:0});
        ['led','neon'].forEach(id=>observer.observe(document.getElementById(id)));
      }
      if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
      registerProductTool();
    } catch(error) {
      root.innerHTML='<p class="load-error">Impossible de charger les produits. Vérifiez votre connexion et <a href="">rechargez la page</a>.</p>';
      console.error(error);
    }
  }
  init();
})();
