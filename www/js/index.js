document.addEventListener('deviceready', loadContacts);

function loadContacts() {

    let options = new ContactFindOptions();
    options.multiple = true;
    options.filter = '';
    let fields = ['*'];

    navigator.contacts.find(fields, showContacts, onError, options);
}

function showContacts(contacts) {
   
    console.log(contacts);
    alert(`${contacts.length} contacts found`);
}

function onError(error) {
    console.log(error)
    alert("an unexpected happen error");
}