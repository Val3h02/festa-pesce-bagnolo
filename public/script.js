document.addEventListener("DOMContentLoaded", () => {
  // Se l'URL contiene "admin.html", siamo nella pagina di amministrazione
  if (document.location.pathname.includes("admin.html")) {
    loadReservations();
  } else {
    // Altrimenti, siamo nella homepage
    setupReservationForm();
  }
});

/* --- Funzioni per la homepage (index.html) --- */
function setupReservationForm() {
  const form = document.getElementById("reservationForm");
  const responseMessage = document.getElementById("responseMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const quantity = document.getElementById("quantity").value;
    const timeSlot = document.getElementById("timeSlot").value;
    const orderDetails = document.getElementById("orderDetails").value; // Nuovo campo

    // Invia i dati al server includendo anche orderDetails
    fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, quantity, timeSlot, orderDetails })
    })
      .then((res) => res.json())
      .then((data) => {
        responseMessage.textContent = "Prenotazione inviata! Riceverai conferma o rifiuto via telefono.";
        form.reset();
      })
      .catch((err) => {
        responseMessage.textContent = "Errore nell'invio della prenotazione.";
      });
  });
}
/* --- Funzioni per la pagina admin (admin.html) --- */
function loadReservations() {
  fetch("/api/reservations")
    .then((res) => res.json())
    .then((reservations) => {
      populateReservationsTable(reservations);
    })
    .catch((err) => {
      console.error("Errore nel caricamento delle prenotazioni:", err);
    });
}

function populateReservationsTable(reservations) {
  const tbody = document.querySelector("#reservationsTable tbody");
  tbody.innerHTML = ""; // Svuota la tabella

  reservations.forEach((reservation) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = reservation.id;

    const tdName = document.createElement("td");
    tdName.textContent = reservation.name;

    const tdPhone = document.createElement("td");
    tdPhone.textContent = reservation.phone;

    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = reservation.quantity;

    const tdTimeSlot = document.createElement("td");
    tdTimeSlot.textContent = reservation.timeSlot;

    const tdStatus = document.createElement("td");
    tdStatus.textContent = reservation.status;

    const tdAction = document.createElement("td");
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Conferma";
    confirmBtn.addEventListener("click", () => updateReservationStatus(reservation.id, "confirmed"));

    const rejectBtn = document.createElement("button");
    rejectBtn.textContent = "Rifiuta";
    rejectBtn.style.marginLeft = "10px";
    rejectBtn.addEventListener("click", () => updateReservationStatus(reservation.id, "rejected"));

    tdAction.appendChild(confirmBtn);
    tdAction.appendChild(rejectBtn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdPhone);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdTimeSlot);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function updateReservationStatus(id, status) {
  fetch("/api/reservations/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data.message);
      // Ricarica la tabella per mostrare lo stato aggiornato
      loadReservations();
    })
    .catch((err) => {
      console.error("Errore nell'aggiornamento della prenotazione:", err);
    });
}
