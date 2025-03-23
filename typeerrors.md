PS C:\Users\MUDUMBA'S\Downloads\main_site-main\main_site-main> npm run build

> apple-gradient-hero@0.0.0 build
> tsc && vite build

src/pages/CorporateGifting/index.tsx:2:18 - error TS6133: 'useScroll' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                   ~~~~~~~~~

src/pages/CorporateGifting/index.tsx:2:29 - error TS6133: 'useSpring' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                              ~~~~~~~~~

src/pages/CorporateGifting/index.tsx:4:1 - error TS6192: All imports in import declaration are unused.      

4 import { useState, useEffect, useRef } from 'react';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/CorporateGifting/index.tsx:20:19 - error TS6133: 'heroInView' is declared but its value is never read.

20   const [heroRef, heroInView] = useInView({
                     ~~~~~~~~~~

src/pages/CorporateGifting/index.tsx:45:10 - error TS6133: 'giftingRef' is declared but its value is never read.

45   const [giftingRef, giftingInView] = useInView({
            ~~~~~~~~~~

src/pages/CorporateGifting/index.tsx:45:22 - error TS6133: 'giftingInView' is declared but its value is never read.

45   const [giftingRef, giftingInView] = useInView({
                        ~~~~~~~~~~~~~

src/pages/CorporateTeamOutings/index.tsx:2:18 - error TS6133: 'useScroll' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                   ~~~~~~~~~

src/pages/CorporateTeamOutings/index.tsx:2:29 - error TS6133: 'useSpring' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                              ~~~~~~~~~

src/pages/CorporateTeamOutings/index.tsx:21:19 - error TS6133: 'heroInView' is declared but its value is never read.

21   const [heroRef, heroInView] = useInView({
                     ~~~~~~~~~~

src/pages/OutboundTeamBuilding/index.tsx:2:18 - error TS6133: 'useScroll' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                   ~~~~~~~~~

src/pages/OutboundTeamBuilding/index.tsx:2:29 - error TS6133: 'useSpring' is declared but its value is never read.

2 import { motion, useScroll, useSpring } from 'framer-motion';
                              ~~~~~~~~~

src/pages/OutboundTeamBuilding/index.tsx:4:1 - error TS6192: All imports in import declaration are unused.  

4 import { useState, useEffect, useRef } from 'react';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/ThankYou/index.tsx:2:18 - error TS6133: 'useScroll' is declared but its value is never read.      

2 import { motion, useScroll, useSpring } from 'framer-motion';
                   ~~~~~~~~~

src/pages/ThankYou/index.tsx:2:29 - error TS6133: 'useSpring' is declared but its value is never read.      

2 import { motion, useScroll, useSpring } from 'framer-motion';
                              ~~~~~~~~~

src/pages/ThankYou/index.tsx:4:1 - error TS6192: All imports in import declaration are unused.

4 import { useState, useEffect, useRef } from 'react';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/ThankYou/index.tsx:20:19 - error TS6133: 'heroInView' is declared but its value is never read.    

20   const [heroRef, heroInView] = useInView({
                     ~~~~~~~~~~


Found 16 errors in 4 files.

Errors  Files
     6  src/pages/CorporateGifting/index.tsx:2
     3  src/pages/CorporateTeamOutings/index.tsx:2
     3  src/pages/OutboundTeamBuilding/index.tsx:2
     4  src/pages/ThankYou/index.tsx:2
PS C:\Users\MUDUMBA'S\Downloads\main_site-main\main_site-main> 