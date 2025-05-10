import React from "react";

interface FAQItem {
  question: string;
  answer: string[];
}

interface FAQSectionProps {
  title: string;
  faqItems: FAQItem[];
  brandColors?: any;
}

function FAQSection({ title, faqItems, brandColors }: FAQSectionProps) {
  return (
    <section style={{ margin: '2rem 0' }}>
      <h2 style={{ color: brandColors?.primary || '#0052A6', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>{title}</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {faqItems.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '1.5rem' }}>
            <strong>{item.question}</strong>
            <ul>
              {item.answer.map((ans, i) => (
                <li key={i}>{ans}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FAQSection; 