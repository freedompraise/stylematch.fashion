// src/services/landingService.ts
import supabase from '@/lib/supabaseClient';

export interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'building' | 'testing' | 'released';
  votes: number;
  priority: number;
  created_by?: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityStat {
  id: string;
  stat_name: string;
  stat_value: number;
  description: string;
  updated_at: string;
}

export interface FeedbackSubmission {
  feedback: string;
  email: string;
  category: 'general' | 'question' | 'interest' | 'other';
}

class LandingService {
  private votedFeatures: Set<string> = new Set();
  private maxVotes = 2;

  constructor() {
    // Load voted features from localStorage
    this.loadVotedFeatures();
  }

  private loadVotedFeatures() {
    try {
      const stored = localStorage.getItem('stylematch_voted_features');
      if (stored) {
        this.votedFeatures = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Could not load voted features from localStorage:', error);
    }
  }

  private saveVotedFeatures() {
    try {
      localStorage.setItem('stylematch_voted_features', JSON.stringify([...this.votedFeatures]));
    } catch (error) {
      console.warn('Could not save voted features to localStorage:', error);
    }
  }

  // Fetch roadmap features
  async getRoadmapFeatures(): Promise<RoadmapFeature[]> {
    const { data, error } = await supabase
      .from('roadmap_features')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching roadmap features:', error);
      throw new Error('Failed to fetch roadmap features');
    }

    return data || [];
  }

  // Check if user can vote
  canVote(): boolean {
    return this.votedFeatures.size < this.maxVotes;
  }

  // Check if user has voted for a specific feature
  hasVotedForFeature(featureId: string): boolean {
    return this.votedFeatures.has(featureId);
  }

  // Get remaining votes
  getRemainingVotes(): number {
    return Math.max(0, this.maxVotes - this.votedFeatures.size);
  }

  // Vote for a feature
  async voteForFeature(featureId: string): Promise<{ success: boolean; message: string }> {
    // Check if user has already voted for this feature
    if (this.hasVotedForFeature(featureId)) {
      return {
        success: false,
        message: "You've already voted for this feature!"
      };
    }

    // Check if user has reached vote limit
    if (!this.canVote()) {
      return {
        success: false,
        message: `You've used all ${this.maxVotes} votes! Vote on different features to spread your support.`
      };
    }

    try {
      const { error } = await supabase
        .from('feature_votes')
        .insert({
          feature_id: featureId,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error voting for feature:', error);
        throw new Error('Failed to vote for feature');
      }

      // Add to local tracking
      this.votedFeatures.add(featureId);
      this.saveVotedFeatures();

      const remaining = this.getRemainingVotes();
      return {
        success: true,
        message: remaining > 0 
          ? `Vote recorded! You have ${remaining} vote${remaining === 1 ? '' : 's'} remaining.`
          : "Vote recorded! You've used all your votes."
      };
    } catch (error) {
      return {
        success: false,
        message: "Could not record your vote. Please try again."
      };
    }
  }

  // Submit feedback
  async submitFeedback(submission: FeedbackSubmission): Promise<void> {
    const { error } = await supabase
      .from('feedback_submissions')
      .insert({
        ...submission,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  // Get community stats (hardcoded)
  async getCommunityStats(): Promise<CommunityStat[]> {

    return [
      {
        id: '1',
        stat_name: 'Feature Votes Cast',
        stat_value: 200,
        description: '200+ Feature Votes Cast',
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        stat_name: 'Features Shipped',
        stat_value: 10,
        description: '15 Features Shipped',
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        stat_name: 'Avg. Response to Feedback',
        stat_value: 24,
        description: '24h Avg. Response to Feedback',
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        stat_name: 'Free to Start',
        stat_value: 100,
        description: '100% Free to Start',
        updated_at: new Date().toISOString(),
      },
    ]
  }

  // Get client IP (simplified - in production, use a proper IP detection service)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return 'unknown';
    }
  }

  // Subscribe to roadmap feature updates
  subscribeToRoadmapUpdates(callback: (features: RoadmapFeature[]) => void) {
    const subscription = supabase
      .channel('roadmap_features')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roadmap_features',
        },
        async () => {
          const features = await this.getRoadmapFeatures();
          callback(features);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const landingService = new LandingService();

