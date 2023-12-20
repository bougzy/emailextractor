// client/src/App.js

import  { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [extractedEmails, setExtractedEmails] = useState([]);

  const extractEmails = async () => {
    try {
      const response = await axios.post('http://localhost:8000/extract-emails', { url });
      setMessage(response.data.message);

      if (response.data.success) {
        // Fetch and set the extracted emails
        const emailsResponse = await axios.get('http://localhost:8000/emails');
        setExtractedEmails(emailsResponse.data);
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while extracting emails.');
    }
  };

  return (
    <Container>
      <h1>Email Extractor</h1>
      <Form>
        <Form.Group controlId="formBasicURL">
          <Form.Label>Enter URL:</Form.Label>
          <Form.Control type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Form.Group>
        <Button variant="primary" onClick={extractEmails}>
          Extract Emails
        </Button>
      </Form>
      <p>{message}</p>

      {extractedEmails.length > 0 && (
        <div>
          <h2>Extracted Emails:</h2>
          <ul>
            {extractedEmails.map((email, index) => (
              <li key={index}>{email.email}</li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}

export default App;
