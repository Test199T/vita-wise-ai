import { create } from "zustand";
import { apiConfig } from "@/config/env";
import { tokenUtils } from "@/lib/utils";

// Types for Analytics
export interface UsageOverview {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    totalSessions: number;
    averageMessagesPerSession: number;
}

export interface DailyTrend {
    date: string;
    count: number;
}

export interface RecentSession {
    id: string;
    title: string;
    messageCount: number;
    lastActivity: string;
}

export interface UsageStats {
    period: {
        days: number;
        startDate: string;
    };
    overview: UsageOverview;
    trends: DailyTrend[];
    recentSessions: RecentSession[];
}

export interface TopicItem {
    topic: string;
    count: number;
}

export interface TopicsStats {
    topics: TopicItem[];
    totalSessions: number;
}

// Search Types
export interface SearchMessage {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
    sessionId: string;
    sessionTitle: string;
    hasImage: boolean;
}

export interface SearchPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface SearchFilters {
    query?: string;
    startDate?: string;
    endDate?: string;
    messageType?: "text" | "image" | "all";
    sessionId?: string;
}

export interface SearchResults {
    messages: SearchMessage[];
    pagination: SearchPagination;
}

// Analytics Store State
interface AnalyticsState {
    // Usage stats
    usage: UsageStats | null;
    isLoadingUsage: boolean;
    usageError: string | null;

    // Topics
    topics: TopicsStats | null;
    isLoadingTopics: boolean;
    topicsError: string | null;

    // Search
    searchResults: SearchResults | null;
    isSearching: boolean;
    searchError: string | null;
    searchFilters: SearchFilters;

    // Actions
    fetchUsage: (days?: number) => Promise<void>;
    fetchTopics: (limit?: number) => Promise<void>;
    searchMessages: (filters: SearchFilters) => Promise<void>;
    clearSearch: () => void;
    setSearchFilters: (filters: Partial<SearchFilters>) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    // Initial state
    usage: null,
    isLoadingUsage: false,
    usageError: null,
    topics: null,
    isLoadingTopics: false,
    topicsError: null,
    searchResults: null,
    isSearching: false,
    searchError: null,
    searchFilters: {},

    // Fetch usage statistics
    fetchUsage: async (days = 30) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        set({ isLoadingUsage: true, usageError: null });

        try {
            const response = await fetch(
                `${apiConfig.baseUrl}/api/chat/analytics/usage?days=${days}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
                set({ usage: result.data });
            } else {
                throw new Error(result.message || "Failed to fetch usage");
            }
        } catch (error) {
            console.error("Error fetching usage:", error);
            set({ usageError: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            set({ isLoadingUsage: false });
        }
    },

    // Fetch popular topics
    fetchTopics: async (limit = 10) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        set({ isLoadingTopics: true, topicsError: null });

        try {
            const response = await fetch(
                `${apiConfig.baseUrl}/api/chat/analytics/topics?limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
                set({ topics: result.data });
            } else {
                throw new Error(result.message || "Failed to fetch topics");
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            set({ topicsError: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            set({ isLoadingTopics: false });
        }
    },

    // Search messages
    searchMessages: async (filters: SearchFilters) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        set({ isSearching: true, searchError: null, searchFilters: filters });

        try {
            const params = new URLSearchParams();
            if (filters.query) params.append("query", filters.query);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            if (filters.messageType) params.append("messageType", filters.messageType);
            if (filters.sessionId) params.append("sessionId", filters.sessionId);

            const response = await fetch(
                `${apiConfig.baseUrl}/api/chat/search?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data) {
                set({ searchResults: result.data });
            } else {
                throw new Error(result.message || "Failed to search");
            }
        } catch (error) {
            console.error("Error searching:", error);
            set({ searchError: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            set({ isSearching: false });
        }
    },

    // Clear search results
    clearSearch: () => {
        set({ searchResults: null, searchFilters: {}, searchError: null });
    },

    // Update search filters
    setSearchFilters: (filters: Partial<SearchFilters>) => {
        set((state) => ({
            searchFilters: { ...state.searchFilters, ...filters },
        }));
    },
}));
