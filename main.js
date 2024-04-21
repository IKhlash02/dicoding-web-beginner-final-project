const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "BOOK_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

function findIndex(bookId) {
  for (const index in books) {
    if (books[index].id == bookId) {
      return index;
    }
  }
  return -1;
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;

  const author = document.getElementById("inputBookAuthor").value;

  const year = parseInt(document.getElementById("inputBookYear").value);

  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget.id == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget.id == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const indexTarget = findIndex(bookId);

  if (indexTarget == -1) return;

  books.splice(indexTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const bookTitle = document.createElement("h4");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis: " + bookObject.author;

  const year = document.createElement("p");
  year.innerText = "Tahun: " + bookObject.year;

  const bookItem = document.createElement("article");
  bookItem.classList.add("book_item", "border", "shadow", "rounded", "p-4");

  const container = document.createElement("div");
  container.classList.add("d-flex", "gap-2", "flex-column");

  const buttonGreen = document.createElement("button");
  buttonGreen.classList.add("btn", "btn-outline-success");

  const buttonRed = document.createElement("button");
  buttonRed.innerText = "Hapus buku";
  buttonRed.classList.add("btn", "btn-outline-danger");
  buttonRed.setAttribute("data-bs-toggle", "modal");
  buttonRed.setAttribute("data-bs-target", "#customDialog");
  buttonRed.addEventListener("click", function () {
    openDialog(bookObject.title)
      .then((result) => {
        if (result) {
          removeBook(bookObject.id);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });

  if (bookObject.isCompleted) {
    buttonGreen.innerText = "Belum selesai di Baca";

    buttonGreen.addEventListener("click", function () {
      undoFromCompleted(bookObject.id);
    });
  } else {
    buttonGreen.innerText = "Selesai dibaca";
    buttonGreen.addEventListener("click", function () {
      addToCompleted(bookObject.id);
    });
  }

  container.append(buttonGreen, buttonRed);
  bookItem.append(bookTitle, bookAuthor, year, container);

  return bookItem;
}

function openDialog(bookTitle) {
  const boldBookTitle = "<b>" + bookTitle + "</b>";

  const textModal = document.getElementById("modal-title");
  textModal.innerHTML = "Apakah kamu yakin menghapus buku " + boldBookTitle + " dari rak?";

  const modalLabel = document.getElementById("customDialogLabel");
  modalLabel.innerText = bookTitle;

  const noDialog = document.getElementById("noButton");
  const okDialog = document.getElementById("okButton");

  return new Promise((resolve, reject) => {
    noDialog.addEventListener("click", function () {
      resolve(false);
    });

    okDialog.addEventListener("click", function () {
      resolve(true);
    });
  });
}

function searchBookByTitle() {
  const title = document.getElementById("searchBookTitle").value;
  const bookList = document.querySelectorAll(".book_item");
  for (const bookElement of bookList) {
    if (!bookElement.childNodes[0].innerText.toLowerCase().includes(title)) {
      bookElement.setAttribute("hidden", "true");
    } else {
      bookElement.removeAttribute("hidden");
    }
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const bookItem of data) {
      books.push(bookItem);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung");
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  var toast = document.getElementById("liveToast");
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 5000);
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchForm = document.getElementById("searchBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBookByTitle();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBooks = document.getElementById("incompleteBookshelfList");
  incompleteBooks.innerHTML = "";

  const completeBooks = document.getElementById("completeBookshelfList");
  completeBooks.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isCompleted) {
      incompleteBooks.append(bookElement);
    } else {
      completeBooks.append(bookElement);
    }
  }
});
