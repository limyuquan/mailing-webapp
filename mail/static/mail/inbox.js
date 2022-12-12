document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");

  // When user compose email
  document
    .querySelector("#compose-submit")
    .addEventListener("click", send_email);
  
    
});

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // fill up composition fields
  document.querySelector("#compose-recipients").value = `${email.sender}`;
  console.log(email.subject.slice(0,3))
  if (email.subject.slice(0,3) === "re:"){
    document.querySelector("#compose-subject").value = `${email.subject}`;
  }else{
    document.querySelector("#compose-subject").value = `re: ${email.subject}`;
  }
  document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`;
}

function load_email(id, mailbox){
  //mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    
    //print out the email listing
    const is_archive = email.archived
    if (is_archive){
      get_archive = "Unarchive"
    } else {
      get_archive = "Archive"
    }

    // if email is sent do not hide archive and unread buttons
    if (mailbox == "sent"){
       sent = "hidden"
    } else{
       sent = ""
    }

    document.querySelector("#view-content").innerHTML = 
    `<div class="email-listing">
      <button class="listing-button" id="archive" ${sent}><i class="fa-solid fa-box-archive"></i> ${get_archive}</button>
      <button class="listing-button" id="unread" ${sent}><i class="fa-brands fa-readme"></i> Unread</button>
      <div class="email-header">
      <p class="listing-subject"> ${email.subject}</p>
        <p class="listing-sender">Sender: ${email.sender}</p>
        <p class="listing-recipients"> Recipients: ${email.recipients}</p>
        <p class="listing-date"> Sent: ${email.timestamp}</p>
      </div>
      <p class="listing-body">${email.body}</p>
      <button class="listing-button" id="reply" ${sent}><i class="fa-solid fa-reply"></i> Reply</button>
    </div>`
    //remove the title
    document.querySelector("#view-title").innerHTML = "";

    if (is_archive) {
      document.querySelector("#archive").addEventListener("click", function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        alert("email has been unarchive")
        load_mailbox("inbox")
    }) } else {
      document.querySelector("#archive").addEventListener("click", function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        alert("email has been archived")
        load_mailbox("inbox")
    })}

    // to unread email
    document.querySelector("#unread").addEventListener("click", function() {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })
      alert("email has been unread")
      load_mailbox(mailbox)
    })
    // for email reply
    document.querySelector("#reply").addEventListener("click", () => reply_email(email))
  
});
}



function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#view-title").innerHTML = `
  <h3><i class="fa-sharp fa-solid fa-envelopes-bulk"></i> ${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  document.querySelector("#view-content").innerHTML = "";

  //load mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      for (let i = 0; i < emails.length; i++) {
        if (emails[i].archive == true){
          continue;
        } 
        document.querySelector("#view-content").innerHTML += 
        `<div class="email-row read-${emails[i].read}" id="email-row" slot="${emails[i].id}">
        <div class="row-content">
          <p class="email-sender"><i class="fa-solid fa-user icon-inbox"></i> ${emails[i].sender}</p>
          <p class="email-date"> ${emails[i].timestamp}</p>
          <p class="email-subject"> ${emails[i].subject} -</p>
          <p class="email-body">${emails[i].body.slice(0, 30)}</p>
        </div>
        </div>`;
      }
      document.querySelectorAll("#email-row").forEach(function(row){
        row.onclick = function(e) {
          load_email(this.slot, mailbox)
        }
      });
    });
}

function send_email() {
  const composeRecipients = document.querySelector("#compose-recipients").value;
  const composeSubject = document.querySelector("#compose-subject").value;
  const composeBody = document.querySelector("#compose-body").value;
  if (!composeSubject) {
    alert("Please key in a subject");
  } else if (!composeBody) {
    alert("Please key in a body");
  } else {
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: composeRecipients,
        subject: composeSubject,
        body: composeBody,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // Print result
        console.log(result);
        if (typeof result.error != "undefined") {
          console.log(result.error);
          alert(`${result.error}`);
        } else {
          alert(`${result.message}`);
        }
      });
  }
}
