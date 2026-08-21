import React from "react";
import dynamic from "next/dynamic";
import TopNavBar from "@/components/TopNavBar";
import ChatArea from "@/components/ChatArea";
import config from "@/config";

const LeftSidebar = dynamic(() => import("@/components/LeftSidebar"), {
  ssr: false,
});
const RightSidebar = dynamic(() => import("@/components/RightSidebar"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="layout-glow-left" aria-hidden />
      <div className="layout-glow-right" aria-hidden />
      <TopNavBar />
      <div className="relative z-10 flex flex-1 overflow-hidden pb-3">
        {config.includeLeftSidebar && <LeftSidebar />}
        <ChatArea />
        {config.includeRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
}
