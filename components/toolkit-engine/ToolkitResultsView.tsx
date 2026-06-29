"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Copy, RefreshCw, CheckCircle2, Hash, Tag, Type, AlignLeft, Search } from "lucide-react";
import type { ToolkitResponse } from "@/domains/toolkit-engine/types";
import { Badge } from "@/components/ui/Badge";

interface ToolkitResultsViewProps {
  initialResult: ToolkitResponse;
  topic: string;
  videoType: "long" | "shorts";
}

export function ToolkitResultsView({ initialResult, topic, videoType }: ToolkitResultsViewProps) {
  const [result, setResult] = useState<ToolkitResponse>(initialResult);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleRegenerate = async (section: keyof ToolkitResponse) => {
    setLoadingSection(section);
    try {
      const res = await fetch("/api/toolkit-engine/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, topic, videoType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult((prev) => ({
        ...prev,
        [section]: section === "description" ? data.result.description : data.result
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate. Please try again.");
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Titles Card */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">SEO Titles</h3>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleRegenerate("titles")}
            disabled={loadingSection === "titles"}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingSection === "titles" ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {result.titles.map((title, i) => (
              <div key={i} className={`p-5 flex items-start justify-between gap-4 transition-colors ${title.is_best ? "bg-blue-50/50" : "hover:bg-gray-50"}`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-gray-900 font-semibold text-lg leading-snug">{title.text}</h4>
                      {title.is_best && (
                        <span className="inline-flex mt-2 items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Best Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 ml-9">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CTR Potential</span>
                      <span className={`text-sm font-semibold ${title.ctr_score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{title.ctr_score}/100</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SEO Score</span>
                      <span className={`text-sm font-semibold ${title.seo_score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{title.seo_score}/100</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Viral Score</span>
                      <span className={`text-sm font-semibold ${title.viral_score > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{title.viral_score}/100</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(title.text, `title-${i}`)}
                  className="text-gray-500 hover:text-gray-900 flex-shrink-0"
                >
                  {copiedSection === `title-${i}` ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Description Card */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">SEO Description</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleCopy(result.description, "description")}
            >
              {copiedSection === "description" ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleRegenerate("description")}
              disabled={loadingSection === "description"}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSection === "description" ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
            {result.description}
          </pre>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keywords Card */}
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">SEO Keywords</h3>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2"
                onClick={() => handleCopy(JSON.stringify(result.keywords, null, 2), "keywords")}
              >
                {copiedSection === "keywords" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2"
                onClick={() => handleRegenerate("keywords")}
                disabled={loadingSection === "keywords"}
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingSection === "keywords" ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Primary Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.primary.map((k, i) => <Badge key={i} variant="blue" className="border-blue-200">{k}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Secondary Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.secondary.map((k, i) => <Badge key={i} variant="default">{k}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Long-Tail Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.long_tail.map((k, i) => <Badge key={i} variant="default">{k}</Badge>)}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tags & Hashtags Column */}
        <div className="space-y-6">
          {/* Tags Card */}
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">YouTube Tags</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2"
                  onClick={() => handleCopy(result.tags.join(", "), "tags")}
                >
                  {copiedSection === "tags" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2"
                  onClick={() => handleRegenerate("tags")}
                  disabled={loadingSection === "tags"}
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingSection === "tags" ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t, i) => <Badge key={i} variant="default">{t}</Badge>)}
              </div>
            </CardBody>
          </Card>

          {/* Hashtags Card */}
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Hashtags</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2"
                  onClick={() => handleCopy([...result.hashtags.primary, ...result.hashtags.secondary, ...result.hashtags.trending].join(" "), "hashtags")}
                >
                  {copiedSection === "hashtags" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2"
                  onClick={() => handleRegenerate("hashtags")}
                  disabled={loadingSection === "hashtags"}
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingSection === "hashtags" ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Primary</h4>
                <p className="text-sm font-medium text-blue-600">{result.hashtags.primary.join(" ")}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Secondary</h4>
                <p className="text-sm font-medium text-gray-700">{result.hashtags.secondary.join(" ")}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trending</h4>
                <p className="text-sm font-medium text-pink-600">{result.hashtags.trending.join(" ")}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
