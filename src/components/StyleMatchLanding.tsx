// src/components/StyleMatchLanding.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { landingService, RoadmapFeature, CommunityStat } from '@/services/landingService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StyleMatchLanding: React.FC = () => {
  const [features, setFeatures] = useState<RoadmapFeature[]>([]);
  const [stats, setStats] = useState<CommunityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'general' | 'question' | 'interest' | 'other'>('general');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'building' | 'planned'>('building');
  const { toast } = useToast();

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
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    const unsubscribe = landingService.subscribeToRoadmapUpdates((updated) => {
      if (mounted) setFeatures(updated);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleVote = async (featureId: string, currentVotes: number) => {
    const result = await landingService.voteForFeature(featureId);
    if (result.success) {
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, votes: currentVotes + 1 } : f))
      );
      toast({ title: 'Vote recorded', description: result.message });
    } else {
      toast({ title: 'Cannot vote', description: result.message, variant: 'destructive' });
    }
  };

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
        title: 'Feedback received',
        description: 'Thank you for your feedback.',
      });
    } catch {
      toast({
        title: 'Submission failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const displayStats = [
    { number: '200+', label: 'Feature Votes Cast' },
    { number: '15', label: 'Features Shipped' },
    { number: '24h', label: 'Avg Response to Feedback' },
    { number: '100%', label: 'Free to Start' },
  ];

  return (
    <main className="scroll-smooth font-inter">

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/media/vendor1.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-slowShow1" />
          <img src="/media/vendor2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-slowShow2" />
          <img src="/media/vendor3.jpg" className="absolute inset-0 w-full h-full object-cover opacity-0 animate-slowShow3" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="z-10 max-w-3xl mx-auto space-y-8">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Come build the future of
            <span className="text-primary block">fashion selling</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-200 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Join vendors shaping StyleMatch. Your voice builds what comes next.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button asChild size="lg" className="px-8 py-4 rounded-full font-semibold text-lg">
              <a href="/auth">Start free</a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-full font-semibold text-lg text-white border-white hover:bg-white hover:text-black"
            >
              <a href="#roadmap">See what we're building</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PAIN POINTS — NO CARDS */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl font-bold">We understand the daily hustle</h2>

          <motion.div
            className="space-y-6 text-xl text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <p>You are juggling orders, chats, pricing and content all at once.</p>
            <p>Some days the sales rush in. Other days everything feels unsure.</p>
            <p>Your business is powerful but the tools around you make it harder than it should be.</p>
          </motion.div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">This is what we're building</h2>
              <p className="text-xl text-muted-foreground">
                A simple platform that makes your fashion business easier to run and easier to grow.
              </p>

              <div className="space-y-5">
                {[
                  'Your products stay visible without daily reposting',
                  'Analytics that show what customers really want',
                  'A storefront that looks clean on any device',
                  'Inventory tracking that stays accurate',
                  'Customer order and pay easily to your account',
                  'You can share your store link with customers to order',
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-lg flex items-start gap-3"
                  >
                    <span className="text-primary text-xl">•</span>
                    {b}
                  </motion.div>
                ))}
              </div>

              <Button asChild size="lg" className="px-8 py-4 rounded-full font-semibold text-lg">
                <a href="/auth">Join the Beta</a>
              </Button>
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
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="py-20 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">We build in public</h2>
            <p className="text-lg text-muted-foreground">
              Track our progress and vote for what matters to you
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {features.filter((f) => f.status === 'released').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-center">What is live now</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {features
                      .filter((f) => f.status === 'released')
                      .map((feature, i) => (
                        <motion.div
                          key={feature.id}
                          className="flex-shrink-0 w-80 rounded-xl p-4 bg-green-100 border border-green-300"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <h4 className="font-semibold text-base mb-1 text-green-900">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-green-700">{feature.description}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <div className="flex bg-white rounded-lg p-1 border border-gray-300">
                  {['building', 'planned'].map((status) => (
                    <button
                      key={status}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === status
                          ? 'bg-primary text-white'
                          : 'text-gray-800 hover:text-black'
                      }`}
                      onClick={() => setActiveTab(status as 'building' | 'planned')}
                    >
                      {status === 'building' ? 'Building' : 'Planned'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {features
                  .filter((f) => f.status === activeTab)
                  .map((feature) => (
                    <motion.div
                      key={feature.id}
                      className="rounded-xl p-4 border border-gray-300 bg-white shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-xs font-semibold text-primary uppercase">
                        {feature.status}
                      </span>

                      <h4 className="font-semibold text-lg mt-2 text-gray-900">
                        {feature.title}
                      </h4>

                      <p className="text-sm text-gray-700 mt-1">{feature.description}</p>

                      <div className="flex justify-start mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(feature.id, feature.votes)}
                          disabled={
                            landingService.hasVotedForFeature(feature.id) ||
                            !landingService.canVote()
                          }
                          className="text-primary hover:text-primary/70 px-0"
                        >
                          👍 {feature.votes}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-20 px-6 bg-muted/5">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-bold">Join a growing community</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-gray-700">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-secondary to-primary text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to start</h2>
          <p className="text-xl text-white/90">
            Create your store in minutes. No fee required.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90"
          >
            <a href="/auth">Continue to sign up</a>
          </Button>
        </div>
      </section>

      {/* FEEDBACK */}
      <section id="feedback" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-bold">Help us build what you need</h2>
          <p className="text-lg text-muted-foreground">
            Share your thoughts or ask a question. We respond quickly.
          </p>

          <div className="bg-muted/30 rounded-2xl p-8">
            <form className="space-y-6" onSubmit={handleFeedback}>
              <Textarea
                placeholder="What would make your business easier..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-32 resize-none"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as 'general' | 'question' | 'interest' | 'other')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="interest">Interested</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={sending}
                size="lg"
                className="px-8 py-4 rounded-lg font-semibold text-lg"
              >
                {sending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground mt-4">
              We usually respond within a day.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-muted-foreground">
        <p>© 2025 StyleMatch Built for fashion vendors</p>
      </footer>
    </main>
  );
};

export default StyleMatchLanding;
