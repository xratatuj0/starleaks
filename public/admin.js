const token = localStorage.token;
const user = JSON.parse(localStorage.user || 'null');

if (!token || user?.role !== 'admin') {
  alert('Brak dostepu');
  location.href = '/';
}

function logout() {
  localStorage.clear();
  location.href = '/login';
}

async function loadMovies() {
  const res = await fetch('/api/admin/movies', { headers: { Authorization: `Bearer ${token}` } });
  const movies = await res.json();
  
  const list = document.getElementById('movieList');
  list.innerHTML = '';
  
  movies.forEach(m => {
    const item = document.createElement('div');
    item.className = 'movie-item';
    item.innerHTML = `
      <div>
        <strong>${m.title}</strong>
        <div style="font-size: 0.9rem; color: #999;">${m.category}</div>
      </div>
      <button onclick="deleteMovie('${m._id}')">Usun</button>
    `;
    list.appendChild(item);
  });
}

async function deleteMovie(id) {
  if (!confirm('Usunac?')) return;
  await fetch(`/api/admin/movies/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadMovies();
}

document.getElementById('movieForm').onsubmit = async (e) => {
  e.preventDefault();
  const movie = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    description: document.getElementById('desc').value,
    image: document.getElementById('image').value,
    playerUrl: document.getElementById('playerUrl').value,
    isPublished: document.getElementById('pub').checked
  };
  
  const res = await fetch('/api/admin/movies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(movie)
  });
  
  if (res.ok) {
    e.target.reset();
    loadMovies();
  }
};

loadMovies();
