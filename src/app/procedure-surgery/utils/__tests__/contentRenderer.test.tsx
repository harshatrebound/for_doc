/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContentBlockRenderer } from '../../components/ContentBlockRenderer';

// Mock the Image component
jest.mock('next/image', () => ({
  // @ts-ignore
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src || ''} alt={props.alt || ''} />;
  },
}));

describe('ContentBlockRenderer', () => {
  it('renders all block types correctly', () => {
    const blocks = [
      { type: 'heading', level: 2, text: 'Procedure Heading' },
      { type: 'paragraph', text: 'This is a paragraph with <strong>formatted</strong> text.' },
      { type: 'heading', level: 3, text: 'Subheading' },
      { type: 'list-item', text: 'List item one' },
      { type: 'list-item', text: 'List item two' },
      { type: 'numbered-list-item', text: 'Numbered item one' },
      { type: 'numbered-list-item', text: 'Numbered item two' },
      { type: 'paragraph', text: 'A concluding paragraph.' },
    ];

    render(<ContentBlockRenderer blocks={blocks} />);

    // Check headings
    expect(screen.getByText('Procedure Heading')).toBeInTheDocument();
    expect(screen.getByText('Subheading')).toBeInTheDocument();
    
    // Check text content in paragraphs
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             content.includes('This is a paragraph with');
    })).toBeInTheDocument();
    
    expect(screen.getByText('A concluding paragraph.')).toBeInTheDocument();
    
    // Check list items
    expect(screen.getByText('List item one')).toBeInTheDocument();
    expect(screen.getByText('List item two')).toBeInTheDocument();
    expect(screen.getByText('Numbered item one')).toBeInTheDocument();
    expect(screen.getByText('Numbered item two')).toBeInTheDocument();
  });

  it('renders empty state when no blocks are provided', () => {
    render(<ContentBlockRenderer blocks={[]} />);
    expect(screen.getByText('No content available for this procedure.')).toBeInTheDocument();
  });
}); 