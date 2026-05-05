import React from "react";
import "@cloudflare/ai-search-snippet";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "search-bar-snippet": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          apiUrl?: string;
          placeholder?: string;
          maxResults?: number;
          maxRenderResults?: number;
          seeMore?: string;
          hideBranding?: boolean;
        },
        HTMLElement
      >;
      "chat-bubble-snippet": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          apiUrl?: string;
        },
        HTMLElement
      >;
      "search-modal-snippet": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          apiUrl?: string;
          placeholder?: string;
          shortcut?: string;
        },
        HTMLElement
      >;
    }
  }
}

export default function AISearch() {
  return (
    <search-bar-snippet
      apiUrl="https://cloudy.avi-kay2019.workers.dev"
      placeholder="Search Any Style or Type of Model"
      maxRenderResults={30}
      seeMore="https://cloudy.avi-kay2019.workers.dev"
      hideBranding={true}
      style={{ '--search-snippet-primary-color': '#000000', '--search-snippet-primary-hover': '#41fbe5', '--search-snippet-focus-ring': '#000000', '--search-snippet-hover-background': '#ffffff', '--search-snippet-text-color': '#000000', '--search-snippet-border-color': '#ffffff' } as React.CSSProperties}
    />
  );
}
