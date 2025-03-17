PS F:\Trebound\trebound_vscode\apple-gradient-hero> npm run build

> apple-gradient-hero@0.0.0 build
> tsc -b && vite build

src/pages/DestinationDetail/index.tsx:11:46 - error TS2307: Cannot find module '../../contexts/ActivitiesContext' or its corresponding type declarations.

11 import { useActivitiesByDestinationId } from '../../contexts/ActivitiesContext';
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/DestinationDetail/index.tsx:115:9 - error TS6198: All destructured elements are unused.

115   const { activities, loading: activitiesLoading } = useActivitiesByDestinationId(destinationId);
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Destinations/index.tsx:8:1 - error TS6133: 'FiMapPin' is declared but its value is never read.

8 import { FiMapPin } from 'react-icons/fi';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Destinations/index.tsx:23:9 - error TS6133: 'regionSlug' is declared but its value is never read.

23   const { regionSlug } = useParams();
           ~~~~~~~~~~~~~~

src/pages/Destinations/index.tsx:29:11 - error TS6133: 'regions' is declared but its value is never read.

29   const { regions, loading: regionsLoading } = useRegions();
             ~~~~~~~

src/pages/Destinations/index.tsx:31:25 - error TS6133: 'setCurrentRegion' is declared but its value is never read.

31   const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
                           ~~~~~~~~~~~~~~~~

src/pages/StayDetail/index.tsx:91:9 - error TS6133: 'displayedImages' is declared but its value is never read.

91   const displayedImages = stayImages.slice(0, Math.min(4, stayImages.length));
           ~~~~~~~~~~~~~~~

src/pages/Stays/index.tsx:1:1 - error TS6133: 'useState' is declared but its value is never read.

1 import { useState } from 'react';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Stays/index.tsx:5:20 - error TS6133: 'FiClock' is declared but its value is never read.

5 import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
                     ~~~~~~~

src/pages/Stays/index.tsx:14:11 - error TS6196: 'StayFilters' is declared but never used.

14 interface StayFilters {
             ~~~~~~~~~~~

src/pages/Stays/index.tsx:23:7 - error TS6133: 'extractTextFromHtml' is declared but its value is never read.

23 const extractTextFromHtml = (html: string | undefined) => {
         ~~~~~~~~~~~~~~~~~~~

src/pages/Stays/index.tsx:74:7 - error TS6133: 'FilterButton' is declared but its value is never read.

74 const FilterButton = ({
         ~~~~~~~~~~~~

src/pages/Stays/index.tsx:95:7 - error TS6133: 'Dropdown' is declared but its value is never read.

95 const Dropdown = ({
         ~~~~~~~~

src/pages/Stays/index.tsx:124:10 - error TS2304: Cannot find name 'FiChevronDown'.

124         <FiChevronDown size={20} />
             ~~~~~~~~~~~~~


Found 14 errors.

PS F:\Trebound\trebound_vscode\apple-gradient-hero> 