// Ay dizisi
const months = [
  "ocak",
  "şubat",
  "mart",
  "nisan",
  "mayıs",
  "haziran",
  "temmuz",
  "ağustos",
  "eylül",
  "ekim",
  "kasım",
  "aralık",
];

// HTML de bulunan elemanlara erişme
const addBox = document.querySelector(".add-box");
const popupBox = document.querySelector(".popup-box");
const popup = document.querySelector(".popup");
const closeBtn = document.querySelector("header i");
const form = document.querySelector("form");
const wrapper = document.querySelector(".wrapper");
const popupTitle = document.querySelector("#popup-title");
const popupButton = document.querySelector("#form-btn");

const DB_NOTES = "notes";

// Local storageda veri varsa parse et yoksa boş bir note dizisi oluştur
let notes = JSON.parse(localStorage.getItem("notes") || []);

let isUpdate = false; // Güncelleme modunda mı?
let updateId = null; // Güncellenmek istenen elemanın id si

// Sayfa yüklendiği anda renderNotes fonksiyonunu çalıştır
document.addEventListener("DOMContentLoaded", renderNotes(notes));

// Notları arayüze render edecek fonksiyon
function renderNotes(notes) {
  //notes dizisi içindeki her eleman için note htmli kaldır

  document.querySelectorAll(".note").forEach((noteItem) => noteItem.remove());

  notes.forEach((note) => {
    let noteHTML = `      <div class="note" data-id=${note.id} >
       
        <div class="details">
          <h2>${note.title}</h2>
          <p>${note.description}</p>
        </div>

     
        <div class="bottom">
          
          <p>${note.date}</p>

         
          <div class="settings">
         
            <i class="bx bx-dots-horizontal-rounded"></i>

        
            <ul class="menu">
              <li class="edit-icon"><i class="bx bx-edit"></i> Edit</li>
              <li class="delete-icon">
                <i class="bx bx-trash"></i>
                Delete
              </li>
            </ul>
          </div>
        </div>
      </div>`;
    // Elimde bir Html elementi var ve bunu arayüze ekle
    // insertAdjacentHTML 2 parametre alır. 1.si ne zaman işlem olacak 2.si ise hangi eleman eklenecek
    addBox.insertAdjacentHTML("afterend", noteHTML);
  });
}

// addBox a tıklanıldığında
addBox.addEventListener("click", () => {
  // popup alanlarına show classını ekle
  popupBox.classList.add("show");
  popup.classList.add("show");
  // popup görünür olduğunda arka planda yer alan elemanların kaydırılmasını engelle
  document.body.style.overflow = "hidden";
});

// close buttona tıklanıldığında popuplardaki show sınıflarını kaldır
closeBtn.addEventListener("click", () => {
  // popup box ve içini görünmez yap
  popupBox.classList.remove("show");
  popup.classList.remove("show");

  // popup pasif olduğunda arka planı varsayılan yap
  document.body.style.overflow = "auto";
});

form.addEventListener("submit", (e) => {
  // form submit edildiğinde ekranın yenilenmesini engelle
  e.preventDefault();

  //   formun içindeki yazı yazılabilen alanlara ulaş
  const titleInput = e.target[0];
  const descriptionInput = e.target[1];

  //   form alanlarının değerleri
  const title = titleInput.value;
  const description = descriptionInput.value;

  //   Herhangi bir alan boş ise
  if (!title || !description) {
    alert("Alanlar boş bırakılamaz.");
    return;
  }

  //   Şu anın tarihini al
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth();
  const updateMonth = months[month]; //ayı sayıdan yazıya çevir
  const year = date.getFullYear();
  const id = date.getTime(); //benzersiz bir sayı

  //   Eğer güncellenen bir elemansa
  if (isUpdate) {
    // Güncellenmek istenen id ile note id sini karşılaştır ve güncellenecek elemanın sırasını bul
    const updateIndex = notes.findIndex((note) => note.id == updateId);

    // Burayı güncelle
    notes[updateIndex] = {
      title,
      description,
      date: `${updateMonth} ${day} ${year}`,
      id,
    };
    // popup güncelle
    popupTitle.textContent = "Yeni Not";
    popupButton.textContent = "Ekle";
    isUpdate = false;
    updateId = null;
  } else {
    // Bir objedir
    let noteItem = {
      title,
      description,
      date: `${updateMonth} ${day} ${year}`,
      id,
    };
    notes.push(noteItem);
  }
  localStorage.setItem(DB_NOTES, JSON.stringify(notes));

  //   Render et,ekranda göster
  renderNotes(notes);

  form.reset(); //form elemanlarının içini temizle

  // popup görünürlüğünü yok et
  popupBox.classList.remove("show");
  popup.classList.remove("show");

  document.body.style.overflow = "auto";
});

// Ekrana tıklanıldığında
wrapper.addEventListener("click", (e) => {
  // Eğer bu  3 noktalı alan ise onu yakala
  if (e.target.classList.contains("bx-dots-horizontal-rounded")) {
    showMenu(e.target);
  } else if (e.target.classList.contains("delete-icon")) {
    deleteNote(e.target);
  } else if (e.target.classList.contains("edit-icon")) {
    editNote(e.target);
  }
});

// Menüyü göster
function showMenu(item) {
  // Üst elemana ulaş
  const parentElement = item.parentElement;

  // Bir üst elemanı göster
  parentElement.classList.add("show");

  document.addEventListener("click", (e) => {
    // Eğer tıklanan i değil veya gelen i değilse
    if (e.target.tagName != "I" || e.target != item) {
      parentElement.classList.remove("show");
    }
  });
}

// Note sil
function deleteNote(item) {
  const response = confirm("Silmek istediğinize emin misiniz?");

  if (response) {
    // Sil butonunun kapsayıcısına eriş
    const noteItem = item.closest(".note");

    // note un data-id sine eriş
    const noteId = Number(noteItem.dataset.id);

    // note id si aynı olan elemanı filtreleme üzerinden ekleme
    notes = notes.filter((note) => note.id != noteId);

    localStorage.setItem(DB_NOTES, JSON.stringify(notes));

    renderNotes(notes);
  }
}

// İçerik güncelle
function editNote(item) {
  popup.classList.add("show");
  popupBox.classList.add("show");

  const note = item.closest(".note");

  const noteId = parseInt(note.dataset.id);

  const foundNote = notes.find((note) => note.id == noteId);

  document.body.style.overflow = "hidden";

  form[0].value = foundNote.title;
  form[1].value = foundNote.description;

  isUpdate = true;
  updateId = noteId;

  popupTitle.textContent = "Notu Güncelle";
  popupButton.textContent = "Güncelle";
}
