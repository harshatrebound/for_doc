import React from "react";

interface TextBlockComponentProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  listItems?: string[];
  orderedListItems?: string[];
  additionalParagraphs?: string[];
  brandColors?: any;
}

function TextBlockComponent({ title, subtitle, paragraphs, listItems, orderedListItems, additionalParagraphs, brandColors }: TextBlockComponentProps) {
  return (
    <section style={{ margin: '2rem 0' }}>
      {title && <h2 style={{ color: brandColors?.primary || '#0052A6', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h2>}
      {subtitle && <h3 style={{ color: brandColors?.secondary || '#00A5E0', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{subtitle}</h3>}
      {paragraphs && paragraphs.map((p, i) => <p key={i} style={{ marginBottom: '0.5rem' }}>{p}</p>)}
      {listItems && (
        <ul style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
      {orderedListItems && (
        <ol style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
          {orderedListItems.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )}
      {additionalParagraphs && additionalParagraphs.map((p, i) => <p key={i} style={{ marginBottom: '0.5rem' }}>{p}</p>)}
    </section>
  );
}

export default TextBlockComponent; 