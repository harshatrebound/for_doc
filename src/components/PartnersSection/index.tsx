import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const partners = [
  {
    name: 'Partner Company 1',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5f_6.webp',
  },
  {
    name: 'Partner Company 2',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5d_32.webp',
  },
  {
    name: 'Partner Company 3',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5b_5.webp',
  },
  {
    name: 'Partner Company 4',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c59_2.webp',
  },
  {
    name: 'Partner Company 5',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e2ec85b68d550746b8d92e_1.webp',
  },
  {
    name: 'Partner Company 6',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c51_18.webp',
  },
  {
    name: 'Partner Company 7',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e2ec85b68d550746b8d92a_27.webp',
  },
  {
    name: 'Partner Company 8',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c57_21.webp',
  },
  {
    name: 'Partner Company 9',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c55_22.webp',
  },
  {
    name: 'Partner Company 10',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c53_20.webp',
  },
  {
    name: 'Partner Company 11',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c4f_23.webp',
  },
  {
    name: 'Partner Company 12',
    logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c4d_17.webp',
  },
];

const PartnersSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="w-full bg-[#eeeeee] py-12" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="block text-sm md:text-base font-medium font-['DM Sans'] text-[#636363] mb-2"
          >
            Our Partners
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-[40px] font-semibold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent"
          >
            Trusted by Industry Leaders
          </motion.h2>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              className="group flex justify-center"
            >
              <motion.img
                src={partner.logo}
                alt={partner.name}
                className="h-8 max-w-full opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 object-contain"
                whileHover={{ scale: 1.05 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
