"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { PLANS, PlanType, PlanConfig } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const JVZOO_LINK = process.env.NEXT_PUBLIC_JVZOO_CHECKOUT_URL || "#";
  const plansList = Object.entries(PLANS) as [PlanType, PlanConfig][];

  return (
    <>
      <Header title="Upgrade to Pro" subtitle="Unlock the full power of CreatorOS AI" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          
          {plansList.map(([key, plan]) => {
            const isFree = key === "free";
            const isPopular = key === "pro";
            
            return (
              <Card key={key} className={cn(
                "relative transition-all hover:shadow-lg flex flex-col",
                isPopular ? "border-blue-200 shadow-xl ring-2 ring-blue-500 scale-105 z-10 bg-white" : "border-gray-200 shadow-sm bg-gray-50/50",
                isFree && "opacity-80"
              )}>
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <CardBody className="p-8 flex flex-col h-full">
                  <h3 className={cn("text-xl font-bold mb-2", isPopular ? "text-blue-900" : "text-gray-900")}>
                    {plan.name}
                  </h3>
                  <p className={cn("text-4xl font-extrabold mb-6", isPopular ? "text-blue-900" : "text-gray-900")}>
                    ₹{plan.price}<span className="text-sm font-medium text-gray-500">/mo</span>
                  </p>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center text-sm font-medium text-gray-700">
                      <Check className={cn("w-4 h-4 mr-3 shrink-0", isPopular ? "text-blue-600" : "text-gray-400")} /> 
                      {plan.limits.ideas_per_day === -1 ? "Unlimited" : plan.limits.ideas_per_day} Video Ideas / day
                    </li>
                    <li className="flex items-center text-sm font-medium text-gray-700">
                      <Check className={cn("w-4 h-4 mr-3 shrink-0", isPopular ? "text-blue-600" : "text-gray-400")} /> 
                      {plan.limits.titles_per_day === -1 ? "Unlimited" : plan.limits.titles_per_day} Titles / day
                    </li>
                    <li className="flex items-center text-sm font-medium text-gray-700">
                      <Check className={cn("w-4 h-4 mr-3 shrink-0", isPopular ? "text-blue-600" : "text-gray-400")} /> 
                      {plan.limits.thumbnails_per_day === -1 ? "Unlimited" : plan.limits.thumbnails_per_day} Thumbnails / day
                    </li>
                    <li className="flex items-center text-sm font-medium text-gray-700">
                      <Check className={cn("w-4 h-4 mr-3 shrink-0", isPopular ? "text-blue-600" : "text-gray-400")} /> 
                      {plan.limits.competitors_total === -1 ? "Unlimited" : plan.limits.competitors_total} Competitors Tracked
                    </li>
                  </ul>
                  
                  <div className="mt-auto">
                    {isFree ? (
                      <Button disabled variant="secondary" className="w-full">Current Plan</Button>
                    ) : (
                      <a href={`${JVZOO_LINK}?plan=${key}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button className={cn(
                          "w-full text-white shadow-md transition-colors",
                          isPopular ? "bg-blue-600 hover:bg-blue-700 text-lg py-6" : "bg-gray-800 hover:bg-gray-900 py-4"
                        )}>
                          Upgrade Now
                        </Button>
                      </a>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
          
        </div>
      </div>
    </>
  );
}
