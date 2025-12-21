import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { motion } from 'framer-motion';

const pictures = [
  'IMG_1311.jpeg',
  'IMG_1341.jpeg',
  'IMG_2488.jpeg',
  'IMG_4347.jpeg',
  'IMG_5430.jpeg',
  'IMG_7136.jpeg',
  'Jets_&_Capital_Miami_BTS_Day_0-58.jpeg',
  'Jets_&_Capital_Miami_BTS_Day_0-83.jpeg',
  'campfire-sparks.jpeg',
  'IMG_0610.jpg',
  'IMG_0611.jpg',
  'IMG_0647.jpg',
  'IMG_1975.jpg',
  'IMG_1976.jpg',
  'IMG_1977.jpg',
  'IMG_1978.jpg',
  'IMG_2001_Original.jpg',
  'IMG_2158_Original.jpg',
  'IMG_8740.jpg',
  'IMG_8922.jpg',
  'IMG_8927.jpg',
  'IMG_9384.jpg',
  'IMG_9707.jpg',
  'IMG_9749.jpg',
  '75140DD1-DBC5-4F23-82B7-EA44DCC2780A.jpg',
  '18766491-0c6d-4bf2-a4e4-35dd80ff985c.jpg',
  '20250619_092213_Original.jpg',
  '20250619_140938_Original.jpg',
  '20250619_141040_Original.jpg',
  'IMG_9029.png',
  'IMG_9032.png',
  'IMG_9451.png',
  'IMG_9577.png',
  'IMG_9714.png',
];

const PicturesPage = () => {
  useKeyboardScroll();

  return (
    <div className="min-h-screen bg-black text-white">
      <WalkwayHeader title="Memories" />
      
      <main className="pt-[200px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4 mb-12">
            <h1 className="text-3xl md:text-4xl tracking-widest uppercase">Hall of Memories</h1>
            <span className="px-3 py-1 bg-white/10 text-sm">
              {pictures.length} moments
            </span>
          </div>
          
          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {pictures.map((picture, index) => (
              <motion.div
                key={picture}
                className="break-inside-avoid mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.02, duration: 0.4 }}
              >
                <div className="border-2 border-white p-2 bg-black">
                  <img 
                    src={`/pictures/${picture}`} 
                    alt={`Memory ${index + 1}`}
                    className="w-full h-auto grayscale"
                    loading={index < 12 ? 'eager' : 'lazy'}
                    fetchPriority={index < 12 ? 'high' : 'auto'}
                    decoding="async"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PicturesPage;
