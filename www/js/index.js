document.addEventListener('deviceready', loadContacts);

function loadContacts() {

    let options = new ContactFindOptions();
    options.multiple = true;
    // options.filter = '';
    let fields = ['*'];

    navigator.contacts.find(fields, showContacts, onError, options);
}

// function showContacts(contacts) {
   
//     console.log(contacts);
//     alert(`${contacts.length} contacts found`);
// }

// function onError(error) {
//     console.log(error)
//     alert("an unexpected happen error");
// }
      let allContacts = [];
      let currentContact = null;

      function showContacts(contacts) {
          console.log(`${contacts.length} contacts found`);
          allContacts = contacts;
          displayContactList(contacts);
      }

      function displayContactList(contacts) {
          const contactList = $('#contactList');
          contactList.empty();

          if (contacts.length === 0) {
              contactList.append('<li><p>Aucun contact trouve</p></li>');
              contactList.listview('refresh');
              return;
          }

          contacts.forEach((contact, index) => {
              const displayName = contact.displayName || contact.name?.formatted || 'Sans nom';
              const phoneNumber = contact.phoneNumbers && contact.phoneNumbers.length > 0 
                  ? contact.phoneNumbers[0].value 
                  : 'Pas de numero';

              const listItem = `
                  <li>
                      <a href="#detailContactPage" onclick="showContactDetails(${index})">
                          <img src="img/contact.png" alt="Contact" class="contact-image">
                          <h2>${displayName}</h2>
                          <p>${phoneNumber}</p>
                      </a>
                  </li>
              `;
              contactList.append(listItem);
          });

          contactList.listview('refresh');
      }

      function searchContacts() {
          const searchTerm = $('#searchInput').val().toLowerCase();
          
          if (searchTerm === '') {
              displayContactList(allContacts);
              return;
          }

          const filteredContacts = allContacts.filter(contact => {
              const name = (contact.displayName || contact.name?.formatted || '').toLowerCase();
              const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0 
                  ? contact.phoneNumbers[0].value.toLowerCase() 
                  : '';
              
              return name.includes(searchTerm) || phone.includes(searchTerm);
          });

          displayContactList(filteredContacts);
      }

      function showContactDetails(index) {
          currentContact = allContacts[index];
          const detailsDiv = $('#contactDetails');
          
          const displayName = currentContact.displayName || currentContact.name?.formatted || 'Sans nom';
          const phoneNumber = currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0 
              ? currentContact.phoneNumbers[0].value 
              : 'Pas de numero';
          const email = currentContact.emails && currentContact.emails.length > 0 
              ? currentContact.emails[0].value 
              : 'Pas d\'email';
          const organization = currentContact.organizations && currentContact.organizations.length > 0 
              ? currentContact.organizations[0].name 
              : 'Pas d\'organisation';

          const detailsHTML = `
              <div class="contact-details">
                  <img src="img/contact.png" alt="Contact">
                  <h1>${displayName}</h1>
              </div>
              <ul data-role="listview" data-inset="true">
                  <li>
                      <h2>Telephone</h2>
                      <p><a href="tel:${phoneNumber}">${phoneNumber}</a></p>
                  </li>
                  <li>
                      <h2>Email</h2>
                      <p><a href="mailto:${email}">${email}</a></p>
                  </li>
                  <li>
                      <h2>Organisation</h2>
                      <p>${organization}</p>
                  </li>
              </ul>
          `;

          detailsDiv.html(detailsHTML);
          detailsDiv.trigger('create');
      }

      function prepareEditContact() {
          if (!currentContact) return;

          $('#editName').val(currentContact.displayName || currentContact.name?.formatted || '');
          $('#editPhone').val(currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0 
              ? currentContact.phoneNumbers[0].value : '');
          $('#editEmail').val(currentContact.emails && currentContact.emails.length > 0 
              ? currentContact.emails[0].value : '');
          $('#editOrganization').val(currentContact.organizations && currentContact.organizations.length > 0 
              ? currentContact.organizations[0].name : '');
      }

      function saveNewContact() {
          const name = $('#addName').val().trim();
          const phone = $('#addPhone').val().trim();
          const email = $('#addEmail').val().trim();
          const organization = $('#addOrganization').val().trim();

          if (!name || !phone) {
              alert('Le nom et le telephone sont obligatoires');
              return;
          }

          if (!navigator.contacts) {
              alert('Plugin contacts non disponible');
              return;
          }

          const contact = navigator.contacts.create();
          contact.displayName = name;
          contact.name = new ContactName();
          contact.name.formatted = name;

          contact.phoneNumbers = [new ContactField('mobile', phone, true)];

          if (email) {
              contact.emails = [new ContactField('home', email, false)];
          }

          if (organization) {
              contact.organizations = [new ContactOrganization()];
              contact.organizations[0].name = organization;
          }

          contact.save(
              function(contact) {
                  alert('Contact ajoute avec succes');
                  $('#addContactForm')[0].reset();
                  loadContacts(); 
                  $.mobile.changePage('#homePage');
              },
              function(error) {
                  alert('Erreur lors de la ajoute: ' + error.code);
              }
          );
      }

      function saveEditedContact() {
          if (!currentContact) return;

          const name = $('#editName').val().trim();
          const phone = $('#editPhone').val().trim();
          const email = $('#editEmail').val().trim();
          const organization = $('#editOrganization').val().trim();

          if (!name || !phone) {
              alert('Le nom et le telephone sont obligatoires');
              return;
          }

          currentContact.displayName = name;
          currentContact.name = currentContact.name || new ContactName();
          currentContact.name.formatted = name;

          if (currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0) {
              currentContact.phoneNumbers[0].value = phone;
          } else {
              currentContact.phoneNumbers = [new ContactField('mobile', phone, true)];
          }

          if (email) {
              if (currentContact.emails && currentContact.emails.length > 0) {
                  currentContact.emails[0].value = email;
              } else {
                  currentContact.emails = [new ContactField('home', email, false)];
              }
          }

          if (organization) {
              if (currentContact.organizations && currentContact.organizations.length > 0) {
                  currentContact.organizations[0].name = organization;
              } else {
                  currentContact.organizations = [new ContactOrganization()];
                  currentContact.organizations[0].name = organization;
              }
          }


          currentContact.save(
              function(contact) {
                  alert('Contact modifie avec succes');
                  loadContacts();
                  $.mobile.changePage('#detailContactPage');
                  showContactDetails(allContacts.indexOf(currentContact));
              },
              function(error) {
                  alert('Erreur lors de la modification: ' + error.code);
              }
          );
      }

      function confirmDeleteContact() {
          if (!currentContact) return;

          if (confirm('etes-vous sur de vouloir supprimer ce contact ?')) {
              deleteContact();
          }
      }

      function deleteContact() {
          if (!currentContact) return;

          currentContact.remove(
              function() {
                  alert('Contact supprime avec succes');
                  loadContacts(); // Recharger la liste
                  $.mobile.changePage('#homePage');
              },
              function(error) {
                  alert('Erreur lors de la suppression: ' + error.code);
              }
          );
      }

      function onError(error) {
          console.log('Erreur:', error);
          alert('Une erreur inattendue s\'est produite: ' + error.code);
      }