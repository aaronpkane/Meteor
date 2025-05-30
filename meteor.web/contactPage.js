// src/pages/ContactPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button'; // We will create a common Button

const ContactContainer = styled.div`
  padding: ${props => props.theme.spacing.large};
  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    text-align: center;
  }
`;

const ContactForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
  display: grid;
  gap: ${props => props.theme.spacing.medium};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: ${props => props.theme.spacing.small};
    font-weight: bold;
  }

  input, textarea {
    padding: ${props => props.theme.spacing.small};
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  textarea {
    min-height: 150px;
    resize: vertical;
  }
`;


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for sending contact form data
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    // Implement actual form submission, e.g., using a Firebase Cloud Function or a third-party service
  };

  return (
    <ContactContainer>
      <h1>Contact Us</h1>
      <ContactForm onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <label htmlFor="subject">Subject:</label>
          <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleChange} required></textarea>
        </FormGroup>
        <Button type="submit">Send Message</Button> {/* Using the common Button component */}
      </ContactForm>
    </ContactContainer>
  );
};

export default ContactPage;
