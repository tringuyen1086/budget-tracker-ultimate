// create db to hold connection
let db;

// indexedBD database connection established as budget-tracker, version 1
const request = indexedDB.open("budget-tracker", 1);

// if version is upgraded, this even will emit. An object store is created as new-transaction
request.onupgradeneeded = function (e) {
  const db = e.target.result;
  db.createOjectStore("new-transaction", { autoIncrement: true });
};

// on success, database created with the object store or established a connection.
// All local database is sent to api if app is online.
request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.online) {
    uploadExpenses();
  }
};

// Show error log if it occurs.
request.onerror = function (e) {
  console.log(e.target.errorCode);
};

// function to be executed when a new transaction is submitted offline.
function saveRecord(record) {
  const transaction = db.transaction(["new-transaction"], "readwrite"); // new transaction with read and write permission
  const fundObjectStore = transaction.objectStore("new-transaction");
  fundObjectStore.add(record);
}

// function to upload transaction
function uploadExpenses() {
  const transaction = db.transaction(["new-transaction"], "readwrite");
  const fundObjectStore = transaction.objectStore("new-transaction");
  const getAll = fundObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new-transaction"], "readwrite");
          const fundObjectStore = transaction.objectStore("new-transaction");
          fundObjectStore.clear(); // clear all stored items
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// check if the connection (online status) of the application
window.addEventListener("online", uploadExpenses);
