// Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyBnqos3SQpZ7MJgYf5hgR_XhJX-eoA9XuA",
  authDomain: "knihovna-44eeb.firebaseapp.com",
  databaseURL: "https://knihovna-44eeb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "knihovna-44eeb",
  storageBucket: "knihovna-44eeb.appspot.com",
  messagingSenderId: "596694421977",
  appId: "1:596694421977:web:3226478ef3aa02be0289c8"
};

// Inicializace Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const booksRef = database.ref('books');

// Zobrazení knih
function displayBooks(books) {
  const bookList = document.getElementById('bookList');
  bookList.innerHTML = '';

  if (!books) {
    bookList.innerHTML = '<p class="empty-message">Žádné knihy v knihovně</p>';
    return;
  }

  Object.keys(books).forEach(bookId => {
    const book = books[bookId];
    const bookElement = document.createElement('div');
    bookElement.className = 'book-item';
    bookElement.innerHTML = `
      <h3>${book.title || 'Neznámý název'}</h3>
      <p><strong>Autor:</strong> ${book.author || 'Neznámý autor'}</p>
      ${book.year ? `<p><strong>Rok:</strong> ${book.year}</p>` : ''}
      <button class="delete-btn" data-id="${bookId}">Smazat</button>
    `;
    bookList.appendChild(bookElement);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteBook(e.target.dataset.id);
    });
  });
}

// Pridani nove knihy
document.getElementById('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const year = document.getElementById('year').value.trim();

  if (!title || !author) {
    alert("Prosím vyplňte název a autora knihy");
    return;
  }

  booksRef.push({
    title,
    author,
    year: year || null,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    document.getElementById('bookForm').reset();
  }).catch(error => {
    console.error("Chyba při ukládání:", error);
    alert("Nepodařilo se uložit knihu");
  });
});

// Vyhledavani knih
document.getElementById('searchButton').addEventListener('click', () => {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  booksRef.once('value').then(snapshot => {
    const allBooks = snapshot.val();
    const filteredBooks = {};

    if (allBooks) {
      Object.keys(allBooks).forEach(bookId => {
        const book = allBooks[bookId];
        const bookYear = book.year ? book.year.toString() : '';
        
        if (book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) ||
            bookYear.includes(searchTerm)) {
          filteredBooks[bookId] = book;
        }
      });
    }

    displayBooks(filteredBooks);
  });
});

// Mazani knihy
function deleteBook(bookId) {
  if (confirm("Opravdu chcete smazat tuto knihu?")) {
    booksRef.child(bookId).remove()
      .catch(error => {
        console.error("Chyba při mazání:", error);
        alert("Nepodařilo se smazat knihu");
      });
  }
}

// Reset vyhledavani
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  if (e.key === 'Escape' || e.target.value === '') {
    booksRef.once('value').then(snapshot => {
      displayBooks(snapshot.val());
    });
  }
});

// Nacteni knih pri startu
booksRef.on('value', (snapshot) => {
  displayBooks(snapshot.val());
});