import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
  return (
    <>
      {/* Hero Section with Parallax Effect */}
      <section className="relative overflow-hidden bg-blue-900 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
          <img 
            src="/assets/memory-background.jpg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Memories Preserved <span className="text-blue-400">Forever</span>
            </h1>
            <p className="text-xl mb-10 text-blue-100 max-w-2xl">
              Securely store your most precious memories on the blockchain, enhanced by AI, and accessible for generations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl">
                Create Memory
              </Link>
              <Link to="/memories" className="px-8 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg font-medium transition-all">
                View Memories
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full opacity-20"></div>
        <div className="absolute top-20 -left-12 w-32 h-32 bg-purple-500 rounded-full opacity-10"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">How Memory Capsule Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: "🔒",
                title: "Blockchain Security",
                description: "Your memories are securely stored on the blockchain, ensuring they can never be altered or deleted."
              },
              {
                icon: "🧠",
                title: "AI Enhancement",
                description: "Our AI technology enhances your memories by generating engaging narratives and improving visual quality."
              },
              {
                icon: "🔗",
                title: "Easy Sharing",
                description: "Share your memories with loved ones through secure links or grant access via their wallet address."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Preserve Your Memories?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect your wallet and start creating timeless memories that will last for generations.
          </p>
          <Link to="/create" className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all inline-block">
            Get Started Now
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;
