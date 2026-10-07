const token = localStorage.token;
const user = JSON.parse(localStorage.user || 'null');

if (!token) location.href = '/login';

document.getElementById('user').textContent = user?.name || 'User';

function logout() {
  localStorage.clear();
  location.href = '/login';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('player').src = '';
}

async function loadMovies(cat = 'all') {
  const url = cat === 'all' ? '/api/movies' : `/api/movies?category=${cat}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const movies = await res.json();
  
  const grid = document.getElementById('movies');
  grid.innerHTML = '';
  
  movies.forEach(m => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${m.image || 'https://via.placeholder.com/300x200?text=Film'}" alt="${m.title}">
      <div>
        <h3>${m.title}</h3>
        <div class="cat">${m.category}</div>
        <button onclick="playMovie('${m.playerUrl.replace(/'/g, "\\'")}')">Odtworz</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function playMovie(url) {
  document.getElementById('player').src = url;
  document.getElementById('modal').classList.remove('hidden');
}

async function loadCategories() {
  const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
  const cats = await res.json();
  
  const nav = document.getElementById('categories');
  
  const allBtn = document.createElement('button');
  allBtn.textContent = 'Wszystko';
  allBtn.onclick = () => loadMovies('all');
  nav.appendChild(allBtn);
  
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.onclick = () => loadMovies(c);
    nav.appendChild(btn);
  });
}

loadCategories();
loadMovies();
