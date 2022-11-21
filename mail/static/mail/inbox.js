document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');  
});


function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  // Add code to listen to submission button, then run send_email function
  document.querySelector('#compose-form').addEventListener('submit', send_email);
}

//Function to load mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Request mails in mailbox depending on mailbox

  fetch(`/emails/${mailbox}`,{
    method: 'GET',
  })
  .then(response => response.json())
  .then(results => {
    console.log(results)

    // ADD LOGIC TO CHECK IF THERE ARE ANY RESULTS AT ALL
    if (results.error !== undefined) {
      alert(results.error)
      display_error(results.error);
      load_mailbox('inbox');
    }
    else if (results.length < 1){
      // No emails in mailbox. add message to mailbox
      let emails_view = document.querySelector('#emails-view');
      let no_emails = document.createTextNode(`No emails in ${mailbox} mailbox.`);
      emails_view.appendChild(no_emails);
    }
    else {
      let emails_view = document.querySelector('#emails-view');
      // Create a div link for each 
      for (email in results) {
        let email_link = document.createElement('a');
        let email_box = document.createElement('div');

        // add link to each email to view the email
        email_link.setAttribute('onclick', `view_email(${results[email].id}, ${mailbox})`);

        // email_link.href=`emails/${results[email].id}`;
        email_link.appendChild(email_box);
        email_box.classList.add('col');
        email_box.style.cssText += 'padding:5px;margin:auto;width:100%;height:40px;border:solid 0.5px;color:black;cursor:pointer;';

        // create hover effect for each email box
        // email_box.classList.add('shadow-sm','rounded');
        email_box.setAttribute('id', 'email-box');

        // populate the email div
        // add sender
        let sender = document.createElement('span');
        sender.innerHTML = results[email].sender;
        sender.style.cssText += 'float:left;font-weight:bold;';
        email_box.append(sender);
        //add subject
        let subject = document.createElement('span');
        subject.innerHTML = results[email].subject;
        subject.style.cssText += 'text-align:center;position:absolute;left:300px;';
        email_box.append(subject);
        // add date
        let date = document.createElement('span');
        date.innerHTML = results[email].timestamp;
        date.style.cssText += 'float:right;';
        email_box.append(date);

        // check if email is read. if yes, grey background
        if (results[email].read === true) {
          email_box.style.backgroundColor = '#f7f5f5';
        }
        // apend emails to email view
        emails_view.appendChild(email_link);
      }

    }

  })
  };

// Function to send email
function send_email() {
  // make a POST request to /emails, passing in values for recipients, subject, and body.

  let recipient_list = document.querySelector('#compose-recipients').value;
  // Gather subject and body of email
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
    
  
  console.log(recipient_list);

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipient_list,
        subject: subject,
        body: body,
      })
  })
  .then(response => response.json())
  .then(result => {

    // error with the email submission
    if (result['error'] !== undefined) {
      display_status(result.error, 'error');
      // console.log(result.error);
    } else {
      display_status(result.message, 'success');
      delay(2500).then(() => load_mailbox('sent'));
    }

  });
  

}

// Function to delay time
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Function to display error message
function display_status(message, status){

  let error_box = document.createElement('div');
  message_box = document.createTextNode(message);
  error_box.appendChild(message_box);
  let hr = document.querySelector('#emails-view');
  hr.insertAdjacentElement("beforebegin",error_box);
  
  // create an element
  if (status == 'error'){
    error_box.style.cssText += 'background-color: #FFBABA;color: #D8000C;font-weight: 300; margin: 25px;width:400px;margin:auto;padding:auto;text-align:center;border-radius:10px;';
  }
  else {
    error_box.style.cssText += 'background-color: #DFF2BF;color: #270;font-weight: 300; margin: 25px;width:400px;margin:auto;padding:auto;text-align:center;border-radius:10px;';
  }
  // use timer function to remove element 
  delay(2500).then(() => error_box.remove());
}

// function to view email when clicked on
function view_email(id){
  fetch(`emails/${id}`, {
    method: 'GET',
    email_id: id,
  })
  .then(response => response.json())
  .then(results => {
  console.log(results)

  // MARK THE EMAIL AS READ //

  // // store email data
  let sender = results['sender'];
  let recipients = results['recipients'];
  let subject = results['subject'];
  let date = results['timestamp'];
  let body = results['body'];

  // Display email

  // First, hide emails view
  let emails_view = document.querySelector('#emails-view');
  emails_view.style.display = 'none';

  // Create div to display email
  let email_div = document.createElement('div');
  email_div.classList.add('col-10','container');
  //Insert email div into dom

  // Create divs to inser into main email display div
  let sender_p = document.createElement('p');
  let recipient_p = document.createElement('p');
  let subject_p = document.createElement('p');
  let date_p = document.createElement('p');
  let reply = document.createElement('button');
  let archive = document.createElement('button');
  let divider = document.createElement('hr');
  let body_p = document.createElement('p');

  // Style elements created
  reply.classList.add('btn', 'btn-sm', 'btn-outline-primary');
  archive.classList.add('btn', 'btn-sm', 'btn-outline-primary');
  
  //Fill divs with email data
  sender_p.innerHTML = `<strong>From:</strong> ${sender}`;
  recipient_p.innerHTML = `<strong>To:</strong> ${recipients}`;
  subject_p.innerHTML = `<strong>Subject:</strong> ${subject}`;
  date_p.innerHTML = `<strong>Date:</strong> ${date}`;
  reply.innerHTML = 'Reply';
  body_p.innerHTML = `${body}`;

  // handle archive button logic 
  if (results['archived'] === true){
    archive.innerHTML = 'Unarchive';
  } else {
    archive.innerHTML = 'Archive';
  }
  const bool = results['archived']
  // Set on click attr to archive button
  archive.setAttribute('onclick', `archive(${results.id}, ${results.archived})`);
  
  // Set on click attr to reply button
  reply.setAttribute('onclick', `reply(${results.id})`);

  // Fill email div with email content
  email_div.appendChild(sender_p);
  email_div.appendChild(recipient_p);
  email_div.appendChild(subject_p);
  email_div.appendChild(date_p);
  email_div.appendChild(reply);
  email_div.appendChild(archive);
  email_div.appendChild(divider);
  email_div.appendChild(body_p);
  
  document.querySelector('body').appendChild(email_div);

  // remove email div view if navigated away from
  document.querySelector('body').addEventListener('click', (e) => {
    const isButton = e.target.nodeName === 'BUTTON';
    if (isButton) {
      email_div.remove();
    }
  })
  })
  .catch(results => {
    display_status(results['message'], 'error');
  });

  // mark the email as read
  fetch(`/emails/${id}`, {
    method:'PUT',
    body: JSON.stringify({
      read: true
    })
  })


}

// Function to archive and unarchive
function archive(id, bool) {
  if (bool === true){
    // update to unarchive the email
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
  } else {
    // update to archive the email
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
  }
  // reload();
  load_mailbox('inbox');  
}

// Function to load and send reply
function reply(id) {

  // load the email compose view
  compose_email();
  // prefill in the content of the email id and some RE: content
  fetch(`/emails/${id}`, {
    method: 'GET',
    email_id: id
  })
  .then(response => response.json())
  .then(results => {
    // Gather email details
    let sender = results['sender'];
    let subject = results['subject'];
    let date = results['timestamp'];
    let body = results['body'];
    
    // Fill content of compose view with email content
    document.querySelector('#compose-recipients').value = sender;
    spliced = subject.slice(0, 3);
    console.log(spliced)
    if (subject.slice(0,3) !== 'RE:'){
      document.querySelector('#compose-subject').value = `RE: ${subject}`;
    } else {
      document.querySelector('#compose-subject').value = subject;
    }
    // Create divider between old email and new response
    const splitter = '________________________________';
    document.querySelector('#compose-body').value = `On ${date} ${sender} wrote:`+ '\r\n' +body + '\r\n' + splitter + '\r\n\r\n';

  })
}