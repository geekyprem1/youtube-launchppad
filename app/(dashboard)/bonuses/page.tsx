"use client";

import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Download, ExternalLink } from "lucide-react";

const DRIVE_URL =
  "https://drive.google.com/drive/folders/1s9WcWH7UmV4u4H9nWXymO6rUr0l20WxL";

const BONUSES = [
  {
    title: "500+ AI Prompt Collection",
    image: "/bonuses/ai-prompt-collection.png",
  },
  {
    title: "Viral YouTube Hook Library",
    image: "/bonuses/viral-hook-library.png",
  },
  {
    title: "365 Viral Content Ideas Vault",
    image: "/bonuses/content-ideas-vault.png",
  },
  {
    title: "Premium Thumbnail Kit",
    image: "/bonuses/premium-thumbnail-kit.png",
  },
  {
    title: "AI Creator Blueprint E-Book",
    image: "/bonuses/ai-creator-blueprint.png",
  },
  {
    title: "YouTube Content Planner",
    image: "/bonuses/youtube-content-planner.png",
  },
] as const;

export default function BonusesPage() {
  return (
    <div className="pb-24">
      <Header
        title="Bonus Download"
        subtitle="Free CreatorOS bonus pack — click any bonus to download"
      />
      <div className="p-6 pb-10 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            6 free bonuses included with CreatorOS. Open the Drive folder to
            download all files.
          </p>
          <a
            href={DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Open bonus folder
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BONUSES.map((bonus) => (
            <a
              key={bonus.title}
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="bg-slate-950 w-full">
                <Image
                  src={bonus.image}
                  alt={bonus.title}
                  width={1024}
                  height={1024}
                  className="w-full h-auto block"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between gap-2 border-t border-gray-100 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                  {bonus.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
