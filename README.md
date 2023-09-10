# mail
An email client that makes API calls to send and receive emails.

Send Mail
  - When a user submits the email composition form, a POST request to /emails is sent using JavaScript code to send the email.
Mailbox
  - When a user visits their Inbox, Sent mailbox, or Archive, a GET request is made to /emails/<mailbox> to request the emails for a particular mailbox.
  - When a mailbox is visited, the application queries the API for the latest emails in that mailbox.
  - If the email is unread, it will appear with a white background. If the email has been read, it will appear with a gray background.
View Email
  - A GET request to /emails/<email_id> is made to request the email.
  - When a user clicks on an email, the user will be taken to a view where they see the content of that email.
  - Once the email has been clicked on, the email is marked as read. A PUT request to /emails/<email_id> will update that an email has been read.
Archive and Unarchive
  - A PUT request to /emails/<email_id> to mark an email as archived or unarchived.
  - When viewing an Inbox email, users can choose to archive the email.
  - When viewing an Archive email, users can choose to unarchive the email.
Reply
  - When viewing an email, users can click on a "Reply" button that lets them reply to the email.
