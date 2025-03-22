
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Cartella pubblica
app.use(express.static(path.join(__dirname, "public")));

// Percorso file JSON per salvare le prenotazioni
const reservationsFilePath = path.join(__dirname, "reservations.json");

// Legge tutte le prenotazioni
app.get("/api/reservations", (req, res) => {
  fs.readFile(reservationsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Errore di lettura del file delle prenotazioni" });
    }
    try {
      const reservations = JSON.parse(data || "[]");
      res.json(reservations);
    } catch (parseErr) {
      return res.status(500).json({ error: "Errore di parsing del file delle prenotazioni" });
    }
  });
});

// Aggiunge una nuova prenotazione
app.post("/api/reservations", (req, res) => {
  const newReservation = {
    id: Date.now(), // ID univoco
    name: req.body.name,
    phone: req.body.phone,
    quantity: req.body.quantity,
    timeSlot: req.body.timeSlot,
    orderDetails: req.body.orderDetails || "", // Nuovo campo per i piatti richiesti
    status: "pending" // pending | confirmed | rejected
  };
  fs.readFile(reservationsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Errore di lettura del file delle prenotazioni" });
    }
    let reservations = [];
    try {
      reservations = JSON.parse(data || "[]");
    } catch (parseErr) {
      // Se il file è vuoto o corrotto, inizializza un array vuoto
      reservations = [];
    }

    reservations.push(newReservation);

    fs.writeFile(reservationsFilePath, JSON.stringify(reservations, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: "Errore di scrittura del file delle prenotazioni" });
      }
      res.json({ message: "Prenotazione ricevuta con successo", reservation: newReservation });
    });
  });
});

// Conferma o rifiuta una prenotazione
app.post("/api/reservations/update", (req, res) => {
  const { id, status } = req.body;

  fs.readFile(reservationsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Errore di lettura del file delle prenotazioni" });
    }
    let reservations = [];
    try {
      reservations = JSON.parse(data || "[]");
    } catch (parseErr) {
      reservations = [];
    }

    // Trova la prenotazione da aggiornare
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Prenotazione non trovata" });
    }

    reservations[index].status = status;

    // Esempio di invio messaggio di conferma/rifiuto (per ora solo console.log)
    if (status === "confirmed") {
      console.log(`Prenotazione ID ${id} confermata. Invia conferma a: ${reservations[index].phone}`);
    } else if (status === "rejected") {
      console.log(`Prenotazione ID ${id} rifiutata. Invia rifiuto a: ${reservations[index].phone}`);
    }

    fs.writeFile(reservationsFilePath, JSON.stringify(reservations, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: "Errore di scrittura del file delle prenotazioni" });
      }
      res.json({ message: "Prenotazione aggiornata correttamente" });
    });
  });
});

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
