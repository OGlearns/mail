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
        email_link.href=`emails/${results[email].id}`;
        email_link.appendChild(email_box);
        email_box.classList.add('col');
        email_box.style.cssText = 'padding:5px;margin:auto;width:100%;height:40px;border:solid 1px;border-bottom:none;color:black;';

        // populate the email div
        // add sender
        let sender = document.createElement('span');
        sender.innerHTML = results[email].sender;
        sender.style.cssText += 'float:left;';
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
        if (email['read'] === true) {
          email_box.style.backgroundColor = '#d3d3d3';
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
    // console.log(result);

    // error with the email submission
    if (result['error'] !== undefined) {
      // reload page
      // compose_email;

      // fill form with submitted content
      document.querySelector('#compose-recipients').value = recipient_list;
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = body;

      // populate the error message
      // let message = document.createElement("p");
      // let text = document.createTextNode(result['error']);
      // message.appendChild(text);
      // let compose = document.querySelector('#compose-view');
      // compose.appendChild(message);

      display_status(result.error, 'error');
      // console.log(result.error);
    } else {
      // successful submission
      
      // document.querySelector('#compose-form').style.display = 'none';

      // populate the success message
      // let message = document.createElement('p');
      // let text = document.createTextNode(result['message']);
      // message.appendChild(text);
      // let compose = document.querySelector('#compose-view');
      // compose.prependChild(message);
      display_status(result.message, 'success')
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
    // append the element 
    // document.querySelector(view).appendChild(error_box);
  }
  else {
    error_box.style.cssText += 'background-color: #DFF2BF;color: #270;font-weight: 300; margin: 25px;width:400px;margin:auto;padding:auto;text-align:center;border-radius:10px;';
  }
  // use timer function to remove element 
  delay(2500).then(() => error_box.remove());
}