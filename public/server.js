document.addEventListener('DOMContentLoaded', () => {
  if (document.location.pathname.includes('admin.html')) {
    loadReservations();
  } else {
    setupReservationForm();
  }
});

/* --- Funzioni per la homepage (index.html) --- */
function setupReservationForm() {
  const reservationForm = document.getElementById('reservationForm');
  const reservationMessage = document.getElementById('reservationMessage');

  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      quantity: document.getElementById('quantity').value,
      timeSlot: document.getElementById('timeSlot').value,
      orderDetails: document.getElementById('orderDetails').value,
    };

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        reservationMessage.textContent =
          'Prenotazione inviata con successo! Ti contatteremo per conferma.';
        reservationMessage.className = 'message success';
        reservationForm.reset();
        reservationMessage.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        reservationMessage.textContent =
          'Si è verificato un errore. Riprova più tardi.';
        reservationMessage.className = 'message error';
        console.error('Error:', error);
      });
  });
}

/* --- Funzioni per la pagina admin (admin.html) --- */
function loadReservations() {
  fetch('/api/reservations')
    .then((response) => response.json())
    .then((reservations) => {
      populateReservationsTable(reservations);
    })
    .catch((error) => {
      console.error('Errore nel caricamento delle prenotazioni:', error);
    });
}

function populateReservationsTable(reservations) {
  const tbody = document.querySelector('#reservationsTable tbody');
  tbody.innerHTML = '';

  reservations.forEach((reservation) => {
    const tr = document.createElement('tr');
    const tdId = document.createElement('td');
    const tdName = document.createElement('td');
    const tdPhone = document.createElement('td');
    const tdQuantity = document.createElement('td');
    const tdTimeSlot = document.createElement('td');
    const tdStatus = document.createElement('td');
    const tdAction = document.createElement('td');
    const confirmBtn = document.createElement('button');
    const rejectBtn = document.createElement('button');

    tdId.textContent = reservation.id;
    tdName.textContent = reservation.name;
    tdPhone.textContent = reservation.phone;
    tdQuantity.textContent = reservation.quantity;
    tdTimeSlot.textContent = reservation.timeSlot;
    tdStatus.textContent = reservation.status;

    confirmBtn.textContent = 'Conferma';
    confirmBtn.addEventListener('click', () =>
      updateReservationStatus(reservation.id, 'confirmed')
    );
    rejectBtn.textContent = 'Rifiuta';
    rejectBtn.style.marginLeft = '10px';
    rejectBtn.addEventListener('click', () =>
      updateReservationStatus(reservation.id, 'rejected')
    );

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
  fetch('/api/reservations/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
      loadReservations();
    })
    .catch((error) => {
      console.error('Errore nell\'aggiornamento della prenotazione:', error);
    });
}