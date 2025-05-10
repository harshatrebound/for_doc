'use client';
import React from 'react';

interface CallToActionProps {
  brandColors: any;
}

function CallToAction({ brandColors }: CallToActionProps) {
  const handleMouseOver = (e: any) => {
    e.currentTarget.style.backgroundColor = brandColors.primary;
  };
  const handleMouseOut = (e: any) => {
    e.currentTarget.style.backgroundColor = brandColors.accent;
  };
  return (
    <div className="py-12" style={{ backgroundColor: brandColors.neutralLight }}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>
          Ready to Discuss Your Knee Health?
        </h2>
        <p className="text-lg mb-8" style={{ color: brandColors.textSecondary }}>
          If you're experiencing knee pain or have been diagnosed with an ACL or meniscus injury, expert advice is crucial. Dr. Naveen Kumar specializes in advanced ACL reconstruction and meniscus repair techniques to help you return to an active, pain-free life.
        </p>
        <a
          href="/book-appointment"
          className="inline-block text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
          style={{ backgroundColor: brandColors.accent, color: brandColors.backgroundLight }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Book Your Consultation
        </a>
      </div>
    </div>
  );
}

export default CallToAction; 