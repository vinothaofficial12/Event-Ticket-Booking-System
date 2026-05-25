import React, { useState, useMemo } from "react";
import { MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Sparkles, Filter, Search, Award, AlertCircle, RefreshCcw, Star } from "lucide-react";
import type { FeedbackData, EventData } from "../types";

// Common English and domain-specific stop words to filter out
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "for", "with", "of", "on", "at", "by", "from", "it", "was", "is", "were", 
  "this", "that", "these", "those", "i", "we", "you", "they", "he", "she", "my", "your", "our", "their", "will", "would", 
  "should", "could", "can", "may", "might", "be", "been", "have", "has", "had", "do", "does", "did", "as", "about", 
  "more", "very", "there", "some", "any", "so", "than", "then", "just", "out", "up", "down", "in", "all", "its", "are", 
  "like", "highly", "perfect", "good", "great", "excellent", "amazing", "wonderful", "outstanding", "fantastic", 
  "incredible", "beautiful", "perfectly", "absolutely", "loved", "really", "very", "much", "etc", "also", "some", 
  "overall", "session", "workshop", "event", "events", "this", "it's", "not", "too", "bit", "needed", "looking", 
  "forward", "focused", "topics", "covered", "how", "what", "who", "which", "where", "why", "back", "next", "one", 
  "day", "done", "take", "make", "get", "got", "well", "think", "best", "super", "really"
]);

interface FeedbackInsightsProps {
  feedbacks: FeedbackData[];
  events: EventData[];
}

interface KeywordItem {
  word: string;
  count: number;
  avgRating: number;
  sentiment: "positive" | "negative" | "neutral";
  associatedFeedbacks: FeedbackData[];
}

export default function FeedbackInsights({ feedbacks, events }: FeedbackInsightsProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItem | null>(null);
  const [minFrequency, setMinFrequency] = useState<number>(1);
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");

  // Get active list of filtered feedbacks based on selected event
  const filteredFeedbacks = useMemo(() => {
    if (selectedEventId === "all") return feedbacks;
    return feedbacks.filter((f) => f.eventId === selectedEventId);
  }, [feedbacks, selectedEventId]);

  // Extract keywords, clean them, and calculate frequencies and ratings
  const keywords = useMemo(() => {
    const counts: Record<string, { count: number; ratingSum: number; items: FeedbackData[] }> = {};

    filteredFeedbacks.forEach((fb) => {
      if (!fb.comment) return;

      // Clean comment text
      const cleanText = fb.comment
        .toLowerCase()
        // Replace punctuation and special characters with spaces
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\n\r[\]]/g, " ");

      const words = cleanText.split(/\s+/);

      // Deduplicate words within the single comment to avoid count manipulation
      const uniqueWordsInComment = new Set<string>(words);

      uniqueWordsInComment.forEach((word: string) => {
        // Skip short words or stop words
        if (word.length <= 2 || STOP_WORDS.has(word)) return;

        if (!counts[word]) {
          counts[word] = { count: 0, ratingSum: 0, items: [] };
        }
        counts[word].count += 1;
        counts[word].ratingSum += fb.rating;
        counts[word].items.push(fb);
      });
    });

    const parsedKeywords: KeywordItem[] = Object.entries(counts).map(([word, data]) => {
      const avgRating = data.ratingSum / data.count;
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      if (avgRating >= 4.0) sentiment = "positive";
      else if (avgRating <= 3.2) sentiment = "negative";

      return {
        word,
        count: data.count,
        avgRating,
        sentiment,
        associatedFeedbacks: data.items,
      };
    });

    // Sort descending by occurrences count
    return parsedKeywords.sort((a, b) => b.count - a.count);
  }, [filteredFeedbacks]);

  // Apply visual-level filters (search and sentiment tab)
  const displayedKeywords = useMemo(() => {
    return keywords.filter((item) => {
      const matchesSearch = item.word.includes(searchTerm.toLowerCase());
      const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
      const matchesFreq = item.count >= minFrequency;
      return matchesSearch && matchesSentiment && matchesFreq;
    });
  }, [keywords, searchTerm, sentimentFilter, minFrequency]);

  // Automatically reset selected keyword if it's no longer in the filtered list
  const isKeywordMatching = selectedKeyword && displayedKeywords.some((k) => k.word === selectedKeyword.word);
  const activeKeyword = isKeywordMatching ? selectedKeyword : null;

  // Calculate highest count for proportional font sizing
  const maxCount = useMemo(() => {
    if (displayedKeywords.length === 0) return 1;
    return Math.max(...displayedKeywords.map((k) => k.count));
  }, [displayedKeywords]);

  // Function to return Tailwind size classes for proportional presentation
  const getProportionalStyle = (count: number) => {
    if (maxCount === 1) return { size: "text-sm", color: "font-medium" };
    const ratio = count / maxCount;
    if (ratio > 0.8) return { size: "text-2xl md:text-3xl font-black tracking-tight", opacity: "opacity-100" };
    if (ratio > 0.5) return { size: "text-xl md:text-2xl font-extrabold tracking-tight", opacity: "opacity-95" };
    if (ratio > 0.3) return { size: "text-md md:text-xl font-bold", opacity: "opacity-90" };
    if (ratio > 0.15) return { size: "text-sm md:text-md font-semibold", opacity: "opacity-80" };
    return { size: "text-xs font-medium", opacity: "opacity-70" };
  };

  // Keyword Sentiment Color Helper
  const getKeywordColor = (item: KeywordItem) => {
    if (item.sentiment === "positive") {
      return "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/40";
    }
    if (item.sentiment === "negative") {
      return "text-red-600 bg-red-50 hover:bg-red-100 border-red-200/50 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40";
    }
    return "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200/50 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40";
  };

  // Actions or recommendations calculator based on student keyword counts
  const dynamicRecommendations = useMemo(() => {
    const list: { id: string; type: "alert" | "info" | "success"; text: string; keywordsTriggered: string[] }[] = [];

    // Look at critical keywords
    const crowded = keywords.find((k) => k.word === "crowded" || k.word === "crowd");
    const delayed = keywords.find((k) => k.word === "delayed" || k.word === "delay" || k.word === "late");
    const food = keywords.find((k) => k.word === "food" || k.word === "coupon" || k.word === "coupons");
    const coders = keywords.find((k) => k.word === "coding" || k.word === "hackathon" || k.word === "code");
    const handsOn = keywords.find((k) => k.word === "hands" || k.word === "practical" || k.word === "lab");

    if (crowded && crowded.count >= 2) {
      list.push({
        id: "rec-crowded",
        type: "alert",
        text: "The student feedback indicates crowd congestion or venue size constraints. Consider reviewing venue capacities or raising reservations limits.",
        keywordsTriggered: ["crowded", "crowd"],
      });
    }
    if (delayed && delayed.count >= 1) {
      list.push({
        id: "rec-delayed",
        type: "alert",
        text: "Delays in schedule or rewards issuance mentioned. Ensure agenda milestones are properly tracked and verify automated food coupon distributions.",
        keywordsTriggered: ["delayed", "delay"],
      });
    }
    if (food && food.count >= 2) {
      list.push({
        id: "rec-food",
        type: "info",
        text: "High volume of food coupon references detected. Students value rewards highly. Continue organizing food inclusions for events with entry fee structures.",
        keywordsTriggered: ["food", "coupon"],
      });
    }
    if (coders && coders.count >= 1) {
      list.push({
        id: "rec-coders",
        type: "success",
        text: "Strong, enthusiastic demand for software coding sessions. We recommend offering additional technical hackathons and specialized programming workshops.",
        keywordsTriggered: ["coding", "hackathon"],
      });
    }
    if (handsOn && handsOn.count >= 1) {
      list.push({
        id: "rec-handson",
        type: "success",
        text: "Students heavily appreciate practical sessions. Increase mechanical and electronic laboratory setups for forthcoming physical engineering seminars.",
        keywordsTriggered: ["hands-on", "practical"],
      });
    }

    return list;
  }, [keywords]);

  return (
    <div id="feedback-insights" className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[3rem] p-6 md:p-8 shadow-sm space-y-8 select-none">
      {/* Header and Filter Utilities */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Campus Opinion Intel</span>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Feedback Keywords &amp; Semantic Analysis
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Analyzing student evaluation texts to surface popular trends, topics, and sentiments.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
          {/* Event Filter */}
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/40 px-3 py-2 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              title="Event filter"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSelectedKeyword(null);
              }}
              className="bg-transparent border-none text-xs text-neutral-700 dark:text-neutral-300 font-bold focus:outline-none focus:ring-0 pr-6 cursor-pointer"
            >
              <option value="all">All Events Combined</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Term */}
          <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-800/40 px-3 py-2 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
            <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Filter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-neutral-700 dark:text-neutral-300 font-bold placeholder-neutral-400 focus:outline-none focus:ring-0 p-0 w-28 md:w-36"
            />
          </div>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            No Student Feedback Collected Yet
          </p>
          <p className="text-xs text-neutral-400">Word cloud and insights will compile when ratings are posted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Word Cloud Column (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
            {/* Sentiment Sub-selectors */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setSentimentFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sentimentFilter === "all"
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  All ({keywords.length})
                </button>
                <button
                  onClick={() => setSentimentFilter("positive")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sentimentFilter === "positive"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-emerald-600 hover:bg-emerald-50/50 dark:text-emerald-400 dark:hover:bg-emerald-900/10"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Pos ({keywords.filter((k) => k.sentiment === "positive").length})
                </button>
                <button
                  onClick={() => setSentimentFilter("negative")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sentimentFilter === "negative"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-900/10"
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  Improv ({keywords.filter((k) => k.sentiment === "negative").length})
                </button>
                <button
                  onClick={() => setSentimentFilter("neutral")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sentimentFilter === "neutral"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-amber-600 hover:bg-amber-50/50 dark:text-amber-400 dark:hover:bg-amber-900/10"
                  }`}
                >
                  Neutral ({keywords.filter((k) => k.sentiment === "neutral").length})
                </button>
              </div>

              {/* Set minimum frequency range */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                  Min Occurrences: {minFrequency}
                </span>
                <input
                  type="range"
                  min="1"
                  max={Math.max(2, maxCount)}
                  value={minFrequency}
                  onChange={(e) => setMinFrequency(Number(e.target.value))}
                  className="w-20 md:w-28 accent-blue-600 h-1 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
                />
              </div>
            </div>

            {/* Simulated Word Cloud Canvas */}
            <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] p-6 min-h-[300px] flex items-center justify-center relative overflow-hidden shadow-inner">
              {displayedKeywords.length === 0 ? (
                <div className="text-center text-neutral-400 dark:text-neutral-600">
                  <p className="text-xs font-bold uppercase tracking-widest">No matching keywords found</p>
                  <p className="text-[10px]">Try adjusting filters or lowering minimum occurrence threshold.</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl px-2 py-4 select-none">
                  {displayedKeywords.map((item) => {
                    const info = getProportionalStyle(item.count);
                    const isSelected = activeKeyword?.word === item.word;
                    return (
                      <button
                        key={item.word}
                        onClick={() => setSelectedKeyword(item)}
                        className={`inline-block border px-3.5 py-2 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative shadow-sm ${getKeywordColor(
                          item
                        )} ${info.size} ${info.opacity} ${
                          isSelected
                            ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900 scale-110 z-10 shadow-md font-black"
                            : ""
                        }`}
                      >
                        <span className="capitalize">{item.word}</span>
                        <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white dark:bg-neutral-700 text-[8px] px-1 rounded-full border border-white dark:border-neutral-800 font-black scale-90">
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metric statistics footer under the cloud */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-800/10 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase leading-none mb-1">Total Vocabulary</p>
                <p className="text-lg font-black text-neutral-800 dark:text-neutral-200">{keywords.length} words</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/10 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase leading-none mb-1">Analyzed Reviews</p>
                <p className="text-lg font-black text-neutral-800 dark:text-neutral-200">{filteredFeedbacks.length} forms</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/10 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase leading-none mb-1">Avg Sentiment</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {filteredFeedbacks.length > 0
                    ? (filteredFeedbacks.reduce((s, f) => s + f.rating, 0) / filteredFeedbacks.length).toFixed(1)
                    : "0.0"}{" "}
                  / 5
                </p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/10 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/40">
                <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase leading-none mb-1">Critical Signals</p>
                <p className="text-lg font-black text-red-600 dark:text-red-400">
                  {keywords.filter((k) => k.sentiment === "negative").length} words
                </p>
              </div>
            </div>
          </div>

          {/* Details & contextual student comments Column (5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-800/20 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 space-y-4 min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
                  <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Keyword Context Panel
                  </h4>
                </div>

                {activeKeyword ? (
                  <div className="space-y-4 flex-1">
                    {/* Active keyword metadata card */}
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                          "{activeKeyword.word}"
                        </span>
                        <span className="text-xs bg-slate-900 text-white dark:bg-neutral-700 dark:text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {activeKeyword.count} Mentions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-400 font-bold uppercase tracking-wider">Associated Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-neutral-700 dark:text-neutral-300">
                            {activeKeyword.avgRating.toFixed(1)}
                          </span>
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(activeKeyword.avgRating) ? "fill-current" : "text-neutral-200 dark:text-neutral-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                      Student comment excerpts ({activeKeyword.associatedFeedbacks.length}):
                    </p>

                    {/* Excerpt comments viewport list */}
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                      {activeKeyword.associatedFeedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                              {fb.userName}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] font-extrabold text-neutral-400">
                              <span>★ {fb.rating}</span>
                              <span>•</span>
                              <span>{new Date(fb.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {/* Highlight search word if possible */}
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium capitalize-first italic">
                            &ldquo;{fb.comment}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-neutral-400">
                    <MessageSquare className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Selection</p>
                    <p className="text-[10px] max-w-[180px] mx-auto mt-1">
                      Click any keyword badge inside the word cloud to inspect student responses.
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Action items and Recommendations block */}
              <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Calculated Experience Advice
                </h5>
                <div className="space-y-2">
                  {dynamicRecommendations.length > 0 ? (
                    dynamicRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={`text-[10px] p-2.5 rounded-lg border flex gap-2 ${
                          rec.type === "alert"
                            ? "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-950/10 dark:border-red-950/20 dark:text-red-300"
                            : rec.type === "success"
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-950/20 dark:text-emerald-300"
                            : "bg-blue-50/50 border-blue-100 text-blue-800 dark:bg-blue-950/10 dark:border-blue-950/20 dark:text-blue-300"
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <div>
                          <p className="font-semibold leading-relaxed">{rec.text}</p>
                          <p className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wide">
                            Triggered words: {rec.keywordsTriggered.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/30 p-2.5 rounded-lg text-center font-bold uppercase tracking-widest">
                      Sentiment positive. No urgent action triggers flagged.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
