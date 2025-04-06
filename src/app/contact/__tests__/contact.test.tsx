/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactPage from '../page';

// Mock the components used by ContactPage
jest.mock('@/components/layout/SiteHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="site-header">Site Header</div>,
}));

jest.mock('@/components/layout/SiteFooter', () => ({
  __esModule: true,
  default: () => <div data-testid="site-footer">Site Footer</div>,
}));

jest.mock('../components/ContactForm', () => ({
  __esModule: true,
  default: () => <div data-testid="contact-form">Contact Form</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ContactPage', () => {
  it('renders the contact information correctly', () => {
    render(<ContactPage />);
    
    // Check if key elements are rendered
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Check for contact information
    expect(screen.getByText(/1084, 2nd Floor, Shirish Foundation/)).toBeInTheDocument();
    expect(screen.getByText('+91 6364538660')).toBeInTheDocument();
    expect(screen.getByText('+91 9008520831')).toBeInTheDocument();
    expect(screen.getByText('+91 80 41276853')).toBeInTheDocument();
    expect(screen.getByText('sportsorthopedics.in@gmail.com')).toBeInTheDocument();
    
    // Check if components are rendered
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });
}); 