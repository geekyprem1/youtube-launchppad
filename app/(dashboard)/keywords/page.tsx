"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Search, Copy, Check, Tag, Clock } from "lucide-react";

interface RelatedKeyword {
  keyword: string;
  competition: string;
  opportunity: number;
}

interface KeywordResult {
  primary_keyword: string;
  opportunity_score: number;
  competition: string;
  estimated_monthly_searches: string;
  related_keywords: RelatedKeyword[];
  long_tail_keywords: string[];
  content_angle: string;
  suggested_titles: string[];
  tags: string[];
  advice: string;
}

interface HistoryItem {
  id: string;
  keyword: string;
  result: KeywordResult;
  created_at: string;
}

const competitionVariant: Record<string, "green" | "yellow" | "red"> = {
  low: "green",
  medium: "yellow",
  high: "red",
};

export default function KeywordsPage() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []));
  }, []);

  async function research() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      const updated = await fetch("/api/keywords").then((r) => r.json());
      setHistory(updated.history || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to research keyword");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Header title="Keyword Research" subtitle="Find low-competition YouTube keywords to rank for" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        <Card>
          <CardBody>
            <div className="flex gap-3">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter topic or keyword — e.g. stock market for beginners, budget cooking India"
                onKeyDown={(e) => e.key === "Enter" && research()}
                className="flex-1"
              />
              <Button onClick={research} loading={loading} disabled={!keyword.trim()}>
                <Search className="w-4 h-4" /> Research
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </CardBody>
        </Card>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="md:col-span-1">
                <CardBody className="flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">Opportunity Score</p>
                  <ScoreRing score={result.opportunity_score} size={80} />
                </CardBody>
              </Card>
              <Card className="md:col-span-3">
                <CardBody>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">"{result.primary_keyword}"</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={competitionVariant[result.competition] || "default"}>
                      {result.competition} competition
                    </Badge>
                    <Badge variant="blue">
                      ~{result.estimated_monthly_searches} monthly searches
                    </Badge>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Best Content Angle</p>
                    <p className="text-sm text-gray-700">{result.content_angle}</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Advice */}
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 italic">💡 {result.advice}</p>
              </CardBody>
            </Card>

            {/* Related Keywords */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-sm text-gray-900">Related Keywords</h3>
              </CardHeader>
              <CardBody>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.related_keywords?.map((kw, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{kw.keyword}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${kw.opportunity}%` }}
                          />
                        </div>
                        <Badge variant={competitionVariant[kw.competition] || "default"}>
                          {kw.competition}
                        </Badge>
                        <button
                          onClick={() => copyText(kw.keyword)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {copied === kw.keyword ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Long-tail Keywords */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900">Long-tail Keywords</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  {result.long_tail_keywords?.map((lt, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-700 flex-1">{lt}</p>
                      <button onClick={() => copyText(lt)} className="ml-2 text-gray-400 hover:text-blue-600">
                        {copied === lt ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* Suggested Titles */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900">Suggested Video Titles</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  {result.suggested_titles?.map((t, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 p-2.5 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-gray-800 flex-1">{t}</p>
                      <button onClick={() => copyText(t)} className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                        {copied === t ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            {/* Tags */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Recommended Video Tags
                </h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {result.tags?.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => copyText(tag)}
                      className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-xs transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Click a tag to copy it</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* History */}
        {history.length > 0 && !result && !loading && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Searches
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setKeyword(item.keyword); setResult(item.result); }}
                  className="text-left"
                >
                  <Card className="hover:border-blue-200 hover:shadow-sm transition-all">
                    <CardBody className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{item.keyword}</p>
                        <Badge variant={competitionVariant[item.result?.competition] || "default"}>
                          {item.result?.competition}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          Opportunity: {item.result?.opportunity_score}/100
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !result && history.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Research any keyword</h3>
            <p className="text-gray-500 text-sm">Find low-competition opportunities and get title suggestions.</p>
          </div>
        )}
      </div>
    </>
  );
}
