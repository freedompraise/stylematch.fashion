// src/components/StyleMatchLanding.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { landingService, RoadmapFeature, CommunityStat } from '@/services/landingService';
import { useToast } from '@/hooks/use-toast';

const StyleMatchLanding: React.FC = () => {
  const [features, setFeatures] = useState<RoadmapFeature[]>([]);
  const [stats, setStats] = useState<CommunityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'general' | 'question' | 'interest' | 'other'>('general');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Fetch data on mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [featuresData, statsData] = await Promise.all([
          landingService.getRoadmapFeatures(),
          landingService.getCommunityStats(),
        ]);

        if (mounted) {
          setFeatures(featuresData);
          setStats(statsData);
        }
      } catch (error) {
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = landingService.subscribeToRoadmapUpdates((updatedFeatures) => {
      if (mounted) {
        setFeatures(updatedFeatures);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [toast]);

  // Handle feature voting
  const handleVote = async (featureId: string, currentVotes: number) => {
    const result = await landingService.voteForFeature(featureId);
    
    if (result.success) {
      // Optimistic update
      setFeatures(prev => 
        prev.map(f => 
          f.id === featureId ? { ...f, votes: currentVotes + 1 } : f
        )
      );
      
      toast({
        title: "Vote recorded!",
        description: result.message,
      });
    } else {
      toast({
        title: "Cannot vote",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  // Handle feedback submission
  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !email.trim()) return;

    setSending(true);
    try {
      await landingService.submitFeedback({
        feedback: feedback.trim(),
        email: email.trim(),
        category,
      });

      setFeedback('');
      setEmail('');
      setCategory('general');

      toast({
        title: "Feedback received!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Could not submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Get hardcoded stats for display
  const displayStats = [
    { number: "200+", label: "Feature Votes Cast" },
    { number: "15", label: "Features Shipped" },
    { number: "24h", label: "Avg. Response to Feedback" },
    { number: "100%", label: "Free to Start" }
  ];

  return (
    <main className="scroll-smooth font-inter">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 animate-fadeCarousel">
          <img src="/media/vendor1.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-show1" />
          <img src="/media/vendor2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-show2" />
          <img src="/media/vendor3.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-show3" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="z-10 max-w-3xl mx-auto space-y-8">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🛠️ We build in public — join the process
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Help us build the future of
            <span className="text-primary block">fashion selling</span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join fashion vendors co-creating StyleMatch. Your feedback shapes every
            feature. Your success is our mission.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a href="/auth" className="btn-primary px-8 py-4 rounded-full font-semibold text-lg">
              Start free
            </a>
            <a href="#roadmap" className="btn-outline px-8 py-4 rounded-full font-semibold text-lg text-white border-white hover:bg-white hover:text-black">
              See what we're building
            </a>
          </motion.div>
          
          <motion.p
            className="text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Free to start • No credit card required
          </motion.p>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">We've been there too</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every fashion vendor knows the daily grind. The endless reposts, the
              payment headaches, the inventory wahala. You're not just selling gowns and shoes. You're building dreams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "😤",
                title: "The Ghosting Game",
                description: "Customers say 'I'll pay tomorrow' then vanish"
              },
              {
                icon: "🔄",
                title: "The 24-Hour Cycle",
                description: "Reposting the same items every day because stories disappear"
              },
              {
                icon: "📱",
                title: "The Payment Problem",
                description: "Tracking who paid, who didn't, and who needs a refund"
              },
              {
                icon: "📦",
                title: "The Inventory Challenge",
                description: "Losing track of what's sold, what's available, what's coming"
              },
              {
                icon: "📊",
                title: "The Customer Blind Spot",
                description: "Never truly knowing which products your customers want"
              },
              {
                icon: "💸",
                title: "The Money Part",
                description: "Making sales but not knowing if you're actually making money"
              }
            ].map((pain, i) => (
              <motion.div
                key={i}
                className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl mb-4">{pain.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-baseContent">{pain.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pain.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">This is what we're building together</h2>
                <p className="text-xl text-muted-foreground">
                  A simple, powerful platform that turns your fashion business into a
                  professional online store. No tech skills required.
                </p>
              </div>
              
              <div className="space-y-6 mb-12">
                {[
                  "🎯 Your products stay live forever — no more daily reposts",
                  "💰 Automated payments with Paystack integration (Coming soon)",
                  "📈 Real-time analytics to see what's actually selling",
                  "📱 Beautiful storefront that works on any device",
                  "🔄 Simple inventory tracking that actually works",
                  "💬 Direct customer communication without messing up your chat"
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-2xl">{benefit.split(' ')[0]}</div>
                    <p className="text-lg">{benefit.substring(2)}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8">
                <a href="/auth" className="btn-primary px-8 py-4 rounded-full font-semibold text-lg inline-block">
                  Join the Beta
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src="/media/storefront_demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-xl max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <p className="font-semibold text-sm">Live Demo</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is what your store could look like in minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="py-24 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">We build in public</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is shaped by your feedback. Vote on what we build next,
              see our progress in real-time, and help us prioritize what matters most.
            </p>
            
            {/* Vote counter */}
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>You have {landingService.getRemainingVotes()} vote{landingService.getRemainingVotes() !== 1 ? 's' : ''} remaining</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`
                     rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border
                    ${feature.status === "released" ? "border-green-200 bg-green-50" : "border-gray-100"}
                  `}
                  whileHover={{ scale: 1.02, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${feature.status === "planned" ? "bg-gray-100 text-gray-700" :
                        feature.status === "building" ? "bg-blue-100 text-blue-700" :
                        feature.status === "testing" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }
                    `}>
                      {feature.status}
                    </span>
                    {feature.status === "released" && (
                      <span className="text-green-600 text-lg">✅</span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-3 text-baseContent">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleVote(feature.id, feature.votes)}
                      disabled={feature.status === "released" || landingService.hasVotedForFeature(feature.id) || !landingService.canVote()}
                      className={`
                        flex items-center space-x-2 text-sm transition-all duration-200
                        ${feature.status === "released" || landingService.hasVotedForFeature(feature.id) || !landingService.canVote()
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-primary hover:text-primary/80 hover:scale-105"
                        }
                      `}
                    >
                      <span className={`
                        ${landingService.hasVotedForFeature(feature.id) ? "text-green-600" : ""}
                      `}>
                        {landingService.hasVotedForFeature(feature.id) ? "✅" : "👍"}
                      </span>
                      <span>{feature.votes} votes</span>
                    </button>
                    {feature.status === "released" && (
                      <span className="text-xs text-green-600 font-medium">Live now!</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COMMUNITY STATS */}
      <section className="py-20 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Join a growing community</h2>
            <p className="text-lg text-muted-foreground">
              Fashion vendors are already building the future with us
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, i) => (
              <motion.div
                key={i}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* PRIMARY CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-secondary to-primary text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to start?</h2>
          <p className="text-xl text-white/90">Create your store in minutes. No credit card required.</p>
          <a href="/auth" className="inline-flex items-center justify-center bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90">
            Continue to sign up
          </a>
        </div>
        
        <p className="text-sm text-white/80 mt-6">We build in public and your feedback guides our roadmap.</p>
      </section>

      {/* FEEDBACK FORM */}
      <section id="feedback" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Help us build what you need</h2>
            <p className="text-xl text-muted-foreground">
              Have general feedback? Want to learn more? We'd love to hear from you.
              Feature suggestions are available in your vendor dashboard.
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-2xl p-8">
            <form className="space-y-6" onSubmit={handleFeedback}>
              <textarea
                placeholder="What would make your fashion business easier? What questions do you have about StyleMatch? What problems keep you up at night?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 h-32 resize-none"
                required
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Your email (so we can follow up)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="general">General Feedback</option>
                  <option value="question">Question</option>
                  <option value="interest">Interested in joining</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Feedback"}
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-primary">
                <span className="text-lg">💡</span>
                <p className="text-sm font-medium">
                  Feature suggestions are vendor-exclusive. 
                  <a href="/auth" className="underline hover:no-underline ml-1">
                    Sign in to suggest features
                  </a>
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              We typically respond within 24 hours and often implement suggestions within a week.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm text-muted-foreground">
        <p>© 2025 StyleMatch · Built with heart for fashion vendors</p>
      </footer>
    </main>
  );
};

export default StyleMatchLanding;

