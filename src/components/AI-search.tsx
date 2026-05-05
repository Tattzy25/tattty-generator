import "@cloudflare/ai-search-snippet";

export default function App() {
  return (
    <search-bar-snippet
      apiUrl="https://3468c3b9-8e29-4366-8182-0fbcafa2411b.search.ai.cloudflare.com/search"
      placeholder="Search Any Style or Type of Model"
      maxRenderResults={30}
      seeMore="https://3468c3b9-8e29-4366-8182-0fbcafa2411b.search.ai.cloudflare.com/search"
      hideBranding={true}
      style={
        {
          "--search-snippet-primary-color": "#000000",
          "--search-snippet-primary-hover": "#41fbe5",
          "--search-snippet-focus-ring": "#000000",
          "--search-snippet-hover-background": "#ffffff",
          "--search-snippet-text-color": "#000000",
          "--search-snippet-border-color": "#ffffff",
        } as React.CSSProperties
      }
    />
  );
}
