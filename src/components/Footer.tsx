'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';

export default function Footer() {
  const { getText } = useAppContext();

  const siteInfo = {
    company_name: 'Jeen Mata Impex',
    tagline: 'Premium Import Solutions',
    contact_email: 'jeenmataimpex8@gmail.com',
    contact_phone: '+977-1-XXXXXXX',
    contact_address: 'Kathmandu, Nepal'
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{siteInfo.company_name}</h3>
            <p className="text-gray-400 text-sm">
              {getText(siteInfo.tagline, 'प्रिमियम आयात समाधान')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{getText('Our Brands', 'हाम्रा ब्रान्डहरू')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>FastDrill</li>
              <li>Spider</li>
              <li>Gorkha</li>
              <li>General Imports</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{getText('Services', 'सेवाहरू')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{getText('Import Solutions', 'आयात समाधान')}</li>
              <li>{getText('Dealer Support', 'डीलर सहयोग')}</li>
              <li>{getText('Shipment Tracking', 'ढुवानी ट्र्याकिङ')}</li>
              <li>{getText('Quality Assurance', 'गुणस्तर आश्वासन')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{getText('Contact', 'सम्पर्क')}</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {siteInfo.contact_address && <p>{siteInfo.contact_address}</p>}
              {siteInfo.contact_email && <p>{siteInfo.contact_email}</p>}
              {siteInfo.contact_phone && <p>{siteInfo.contact_phone}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 {siteInfo.company_name}. {getText('All rights reserved.', 'सबै अधिकार सुरक्षित।')}</p>
        </div>
      </div>
    </footer>
  );
}
