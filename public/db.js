let db;
//create a new db request for a "budgetTracker" database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    const db = event.target.result;
    //create object store "pending"
    db.createObjectStore("pending", {autoIncrement:true});
};

request.onsuccess = function (event) {
    db = event.target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("Woops!" + event.target.errorCode);
};

function saveRecord(record){
    //create a transaction on the pending db
    const transaction = db.transaction(["pending"], "readwrite");
    //access pending object store
    const pendingStore = transaction.objectStore("pending");
    //add record to pending store with add method
    pendingStore.add(record);
}
function checkDatabase(){
    //open a transaction on pending db
    const transaction = db.transaction(["pending"], "readwrite");
    //access pending object store
    const store = transaction.objectStore("pending");
    //get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function(){
        if (getAll.result.length >0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            })
            .then(res => res.json())
            .then(() => {
                //if successful, open a transaction on pending db
                const transaction = db.transaction(["pending"], "readwrite");
                //accesss pending object store
                const pendingStore = transaction.objectStore("pending");
                //clear all items in object store
                pendingStore.clear();
            })
        }
    }
}

//list for app coming back online
window.addEventListener("online", checkDatabase)