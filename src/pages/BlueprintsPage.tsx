import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';

const BlueprintsPage = () => {
  return (
    <div className="min-h-[300vh] bg-background">
      <WalkwayHeader title="Blueprints" />
      
      <main className="pt-[200px] px-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-4xl tracking-widest uppercase mb-16">Blueprints</h1>
          
          <div className="space-y-24 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              The architecture of ideas.
            </p>
            
            <div className="h-[60vh]" />
            
            <p className="text-lg">
              Plans, sketches, and future visions.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlueprintsPage;
