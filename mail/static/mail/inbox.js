let curMailbox = null;
let curEmail = null;

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // When form is submitted, send a new email
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // Allow user to mark an email as archived or unarchived
  document.querySelector('#archive').addEventListener('click', () => archive_current_email(true));
  document.querySelector('#unarchive').addEventListener('click', () => archive_current_email(false));

  // Handle when user replies to an email
  document.querySelector('#reply').addEventListener('click', compose_reply);

  // By default, load the inbox
  load_mailbox('inbox');
});

function add_email_to_mailbox(email) {

  // Create a new element for the email
  const row = document.createElement('div');
  row.classList.add('email-row');
  if (email.read) {
    row.classList.add('email-read');
  }
  row.innerHTML = `<strong>${email.sender}</strong> ${email.subject} <span class='email-timestamp'>${email.timestamp}</span>`;

  // When row is clicked on, show the email
  row.addEventListener('click', function() {
    show_email(email.id);
  });

  // Add row to the view
  document.querySelector('#emails-view').append(row);
}

function archive_current_email(archived) {
  fetch(`/emails/${curEmail.id}`, {
    method: 'PUT',
    body: JSON.stringify({archived: archived})
  });
  load_mailbox('inbox');
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function compose_reply() {

  // Start a new email
  compose_email(); 

  // Pre-fill recipients, subject, and body with standard reply-to information
  document.querySelector('#compose-recipients').value = curEmail.sender;
  document.querySelector('#compose-subject').value = curEmail.subject.slice(0, 4) === 'Re: ' ? curEmail.subject : `Re: ${curEmail.subject}`;
  document.querySelector('#compose-body').value = `\n\nOn ${curEmail.timestamp} ${curEmail.sender} wrote:\n${curEmail.body}`;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  curMailbox = mailbox;
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Query for latest emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    if (emails.length === 0) {
      document.querySelector('#emails-view').innerHTML += 'No emails in this mailbox.';
    }
    emails.forEach(add_email_to_mailbox);
  });
}

function send_email(event) {

  // Collect information about email from DOM
  const data = {
    recipients: document.querySelector('#compose-recipients').value,
    subject: document.querySelector('#compose-subject').value,
    body: document.querySelector('#compose-body').value
  };

  // Send API request to create new email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(() => {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    load_mailbox('sent');
  });
  event.preventDefault();
}

function show_email(email_id) {

  // Show archive or unarchive buttons depending on current mailbox
  document.querySelector('#archive').style.display = curMailbox === 'inbox' ? 'inline-block' : 'none';
  document.querySelector('#unarchive').style.display = curMailbox === 'archive' ? 'inline-block' : 'none';

  // Show the email view and hide the other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear out email contents
  document.querySelector('#email-from').innerHTML = '';
  document.querySelector('#email-to').innerHTML = '';
  document.querySelector('#email-subject').innerHTML = '';
  document.querySelector('#email-timestamp').innerHTML = '';
  document.querySelector('#email-body').innerHTML = '';

  // Query for email details and fill data into DOM
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    curEmail = email;
    document.querySelector('#email-from').appendChild(document.createTextNode(email.sender));
    document.querySelector('#email-to').appendChild(document.createTextNode(email.recipients));
    document.querySelector('#email-subject').appendChild(document.createTextNode(email.subject));
    document.querySelector('#email-timestamp').appendChild(document.createTextNode(email.timestamp));
    email.body.split('\n').forEach(line => {
      document.querySelector('#email-body').appendChild(document.createTextNode(line));
      document.querySelector('#email-body').appendChild(document.createElement('br'));
    })
  });

  // Mark email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}