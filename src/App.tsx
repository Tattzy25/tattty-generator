import React, { useState } from 'react';
import { Share2, Download, Wand2, Lock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { MotionAccordion } from './components/unlumen-ui/motion-faqs-accordion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DIFY_MCP_URL = '/api/generate';

const MODEL = {
  model_name: 'tattzy25/tattty_4_all',
  artist_name: 'TaTTTy',
  tags: ['Tattoo', 'Portrait'],
};

export default function App() {
  const [promptText, setPromptText] = useState('');
  const [colorMode, setColorMode] = useState('black');
  const [numOutputs, setNumOutputs] = useState('4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const [selectedCarouselIdx, setSelectedCarouselIdx] = useState<number>(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const promptQuestion = import.meta.env.VITE_PROMPT_QUESTION;


  const carouselImages = [
    { url: "https://styles.tattty.com/1%20(1).png",                          label: "Black & White" },
    { url: "https://styles.tattty.com/1%20(7).png",                          label: "Black & White" },
    { url: "https://styles.tattty.com/ANIME.png",                            label: "Anime" },
    { url: "https://styles.tattty.com/Cyberpunk-portrait%20(1).png",         label: "Cyberpunk" },
    { url: "https://styles.tattty.com/Realism.png",                          label: "Realism" },
    { url: "https://styles.tattty.com/Untitled%20design%20(3).png",          label: "Portrait" },
    { url: "https://styles.tattty.com/alchemical-etch-portrait.png",         label: "Alchemical Etch" },
    { url: "https://styles.tattty.com/anime-portrait%20(1).png",             label: "Anime Portrait" },
    { url: "https://styles.tattty.com/brutalism-portrait%20(1).png",         label: "Brutalism" },
    { url: "https://styles.tattty.com/brutalism-portrait.png",               label: "Brutalism" },
    { url: "https://styles.tattty.com/chi.jpg",                              label: "Chi" },
    { url: "https://styles.tattty.com/continuous-line-portrait%20(1).png",   label: "Continuous Line" },
    { url: "https://styles.tattty.com/download.png",                         label: "Polka Trash" },
    { url: "https://styles.tattty.com/futuristic-portrait%20(1).png",        label: "Futuristic" },
    { url: "https://styles.tattty.com/heavy-blackwork-portrait.png",         label: "Heavy Blackwork" },
    { url: "https://styles.tattty.com/ignorant-tattoo-portrait%20(1).png",   label: "Ignorant" },
    { url: "https://styles.tattty.com/ignorant-tattoo-portrait%20(2).png",   label: "Ignorant" },
    { url: "https://styles.tattty.com/lofi-comic-portrait.png",              label: "Lofi Comic" },
    { url: "https://styles.tattty.com/out-0%20(33).webp",                    label: "Watercolor" },
    { url: "https://styles.tattty.com/sketchwork-portrait%20(1).png",        label: "Sketchwork" },
  ];

  const handleGenerateImage = async () => {
    if (promptText.trim().length < 10) {
      toast.error('Please write at least 10 characters to describe your vision.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const res = await fetch(DIFY_MCP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method: 'tools/call',
          params: {
            name: 'TaTTTy-MCP',
            arguments: {
              user_story: promptText.trim(),
              artistic_style: carouselImages[selectedCarouselIdx].label,
              color_prefrence: colorMode,
              number_of_outputs: parseInt(numOutputs),
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(JSON.stringify(data));
      const urls: string[] = data.output;
      if (!urls.length) throw new Error('No image URLs in response.');
      setGeneratedImages(urls);
      toast.success(`Generated — Style: ${carouselImages[selectedCarouselIdx].label} | Color: ${colorMode} | Outputs: ${numOutputs}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareEmbed = async () => {
    if (navigator.share) {
      await navigator.share({
        title: MODEL.model_name,
        text: 'Embed this generator on your site',
        url: `${window.location.origin}/embed/${MODEL.model_name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center py-2 md:py-4 px-[10px]">
      <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500 flex flex-col">
        <div
          style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
          className="w-full rounded-[40px] overflow-hidden bg-white shadow-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="w-full bg-white shrink-0 border-b-2 border-black/5 shadow-sm py-2 md:py-3 px-4 md:px-6">
            {/* Mobile: centered layout */}
            <div className="flex md:hidden flex-col items-center gap-1.5">
              {/* Row 1: Model name */}
              <div className="flex items-baseline justify-center gap-0.5 min-w-0">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 shrink-0 mr-2">Model</span>
                <span className="text-[16px] font-bold text-gray-800 uppercase leading-none truncate" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {MODEL.model_name.split('/')[0]}
                </span>
                {MODEL.model_name.includes('/') && (
                  <span className="text-[13px] text-black leading-none truncate" style={{ fontFamily: "'Rock Salt', cursive" }}>
                    /{MODEL.model_name.split('/').slice(1).join('/')}
                  </span>
                )}
              </div>
              {/* Row 2: Artist, Tags */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">Artist</span>
                  <span className="text-[13px] text-black leading-none" style={{ fontFamily: "'Rock Salt', cursive" }}>
                    {MODEL.artist_name}
                  </span>
                </div>
                <div className="w-[1px] self-stretch bg-gray-200" />
                <div className="flex items-center gap-1">
                  {MODEL.tags.slice(0, 2).map((tag, i) => (
                    <span key={`${tag}-${i}`} className="text-[9px] font-black tracking-widest text-gray-500 uppercase px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: single row */}
            <div className="hidden md:flex flex-nowrap items-start justify-center gap-x-6">
              {/* Model */}
              <div className="flex flex-col items-start gap-1 shrink-0">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Model</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-bold text-gray-800 uppercase leading-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {MODEL.model_name.split('/')[0]}
                  </span>
                  {MODEL.model_name.includes('/') && (
                    <span className="text-[22px] text-black leading-none" style={{ fontFamily: "'Rock Salt', cursive" }}>
                      /{MODEL.model_name.split('/').slice(1).join('/')}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-[1px] self-stretch bg-gray-200 shrink-0" />

              {/* Artist */}
              <div className="flex flex-col items-start gap-1 shrink-0">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Artist</span>
                <span className="text-[22px] text-black leading-none" style={{ fontFamily: "'Rock Salt', cursive" }}>
                  {MODEL.artist_name}
                </span>
              </div>

              <div className="w-[1px] self-stretch bg-gray-200 shrink-0" />

              {/* Tags */}
              <div className="flex flex-col items-start gap-1 shrink-0">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Tags</span>
                <div className="flex items-center gap-2">
                  {MODEL.tags.slice(0, 2).map((tag, i) => (
                    <span key={`${tag}-${i}`} className="text-[15px] font-black tracking-widest text-gray-500 uppercase px-2 py-0.5 bg-gray-50 rounded border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-center items-stretch gap-4 xl:gap-5 p-[10px] relative">

            {/* LEFT - VERTICAL MODEL CAROUSEL */}
            <div className="hidden md:flex w-[150px] flex-shrink-0 flex-col h-[450px] pt-[30px]">
              <div className="relative w-full flex-1 overflow-hidden">
                {/* Top fade */}
                <div className="absolute top-0 left-0 right-0 h-[40px] z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #ffffff, transparent)' }} />
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-[40px] z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }} />
              <div
                className="w-full h-full overflow-y-auto hide-scrollbar flex flex-col gap-3 py-2 items-center"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {[...carouselImages, ...carouselImages, ...carouselImages].map((item, idx) => {
                  const realIdx = idx % carouselImages.length;
                  const isSelected = selectedCarouselIdx === realIdx;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedCarouselIdx(realIdx)}
                      className={cn(
                        "w-[150px] flex-shrink-0 rounded-[20px] overflow-hidden border-[3px] transition-colors duration-150 focus-visible:outline-none flex flex-col",
                        isSelected ? "border-black" : "border-transparent"
                      )}
                    >
                      <div className="w-full h-[150px] relative">
                        <img
                          src={item.url}
                          alt={item.label || ""}
                          width={150}
                          height={150}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {item.label && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                            <span className="text-white text-[9px] font-bold tracking-[0.15em] uppercase">{item.label}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>

            {/* MIDDLE - TRIGGER WORD, PROMPT, UPLOAD */}
            <div className="w-full md:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col animate-in fade-in duration-700 delay-150 fill-mode-both">

              {/* MOBILE STYLE CAROUSEL */}
              <div className="flex md:hidden w-full overflow-x-auto hide-scrollbar gap-2 px-1 pt-[10px]">
                {carouselImages.map((item, idx) => {
                  const isSelected = selectedCarouselIdx === idx;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedCarouselIdx(idx)}
                      style={{ touchAction: 'manipulation' }}
                      className={cn(
                        "flex-shrink-0 rounded-[16px] overflow-hidden border-[3px] transition-colors duration-150 focus-visible:outline-none flex flex-col",
                        isSelected ? "border-black" : "border-transparent"
                      )}
                    >
                      <div className="w-[100px] h-[100px] relative">
                        <img src={item.url} alt={item.label} loading="lazy" className="w-full h-full object-cover" />
                        {item.label && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                            <span className="text-white text-[8px] font-bold tracking-[0.1em] uppercase">{item.label}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* TOP CONTENT */}
              <div className="w-full flex flex-col items-center pt-[30px] md:pt-[20px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[14px] font-bold tracking-[0.2em] text-black uppercase">Color Mode</div>
                  <div className="flex items-center gap-2">
                    {['color', 'black'].map((mode) => (
                      <label key={mode} className={cn(
                        'flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-full transition-all',
                        colorMode === mode ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}>
                        <input type="radio" name="colorMode" value={mode} checked={colorMode === mode} onChange={() => setColorMode(mode)} className="sr-only" />
                        <span className="text-[14px] font-bold tracking-wider uppercase">{mode === 'black' ? 'B&W' : 'Color'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-[25px] md:gap-3 w-full px-4 mt-[30px] md:mt-[8px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold tracking-[0.2em] text-black uppercase">Number Outputs</span>
                    <span className="text-[18px] font-bold text-black">{numOutputs}</span>
                  </div>
                  <Slider
                    min={1}
                    max={4}
                    step={1}
                    value={[parseInt(numOutputs)]}
                    onValueChange={(val) => setNumOutputs(String(val[0]))}
                    className="w-full"
                  />
                </div>

                <MotionAccordion
                  items={[{
                    question: (
                      <span className="flex items-center gap-3">
                        <Lock className="w-4 h-4 shrink-0 text-gray-500" />
                        <span className="text-[13px] font-bold tracking-[0.2em] uppercase text-gray-500">Click to Unlock</span>
                      </span>
                    ),
                    answer: promptQuestion
                  }]}
                  className="w-full overflow-hidden rounded-[30px] border-[2px] border-black mt-[40px] md:mt-[20px]"
                />
              </div>

              {/* Textarea - flex-1 locks bottom to button, top floats */}
              <textarea
                id="promptText"
                name="promptText"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                className="w-full p-3 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-black text-left font-medium placeholder:text-gray-300 bg-transparent resize-y text-[18px] mt-[30px] md:mt-[10px] mb-[30px] md:mb-[6px] min-h-[160px]"
                placeholder="A cinematic portrait..."
              />

              {/* BUTTON - isolated at bottom, never moves */}
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !promptText.trim()}
                className="w-full bg-black text-white rounded-xl py-4 font-bold text-[14px] tracking-[0.25em] uppercase hover:bg-gray-900 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                {isGenerating ? 'CREATING...' : 'CREATE MY IMAGE'}
              </button>
            </div>

            {/* RIGHT - RENDERS */}
            <div className="w-full md:flex-1 animate-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both pt-[20px]">
              <div className="w-full flex flex-col">
                <div className="w-full flex flex-col h-[320px] md:h-[480px]">
                  {/* Action Icons */}
                  <div className={cn(
                    "flex items-center justify-center gap-3 transition-all duration-300",
                    generatedImages.length > 0 ? "h-12 mb-2" : "h-0 mb-0 overflow-hidden"
                  )}>
                    {generatedImages.length > 0 && (
                      <>
                        {/* Download All */}
                        <button
                          onClick={() => {
                            generatedImages.forEach((img, i) => {
                              setTimeout(() => {
                                const a = document.createElement('a');
                                a.href = img;
                                a.download = `tattty-${i+1}.png`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }, i * 400);
                            });
                          }}
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                          title="Download All"
                        >
                          <Download className="w-6 h-6" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Download All</span>
                        </button>
                        {/* Share */}
                        <button
                          onClick={handleShareEmbed}
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                          title="Share"
                        >
                          <Share2 className="w-6 h-6" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Share</span>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Image / Placeholder */}
                  <div className="flex-1 min-h-0 w-full">
                    {generatedImages.length > 0 ? (
                      <div className={cn(
                        "w-full h-full rounded-3xl overflow-hidden shadow-lg bg-gray-100",
                        generatedImages.length > 1 && "grid gap-2 p-2",
                        generatedImages.length === 2 && "grid-cols-2",
                        generatedImages.length === 3 && "grid-cols-2 grid-rows-2",
                        generatedImages.length === 4 && "grid-cols-2 grid-rows-2"
                      )}>
                        {generatedImages.length === 1 ? (
                          <div className="relative group w-full h-full">
                            <img
                              src={generatedImages[0]}
                              alt="Generated result"
                              className="w-full h-full object-cover cursor-zoom-in"
                              onClick={() => setLightboxImg(generatedImages[0])}
                            />
                            <button
                              type="button"
                              onClick={() => { const a = document.createElement('a'); a.href = generatedImages[0]; a.download = 'tattty-1.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                              className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          generatedImages.map((img, i) => (
                            <div
                              key={i}
                              className={cn(
                                "relative group overflow-hidden rounded-xl bg-gray-200 cursor-zoom-in",
                                generatedImages.length === 3 && i === 2 ? "col-span-2" : ""
                              )}
                              onClick={() => setLightboxImg(img)}
                            >
                              <img src={img} alt={`Generated result ${i+1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = img; a.download = `tattty-${i+1}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                        {isGenerating ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            <p className="text-[18px] font-bold tracking-[0.2em] uppercase text-gray-500">Creating Magic...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Wand2 className="w-20 h-20 text-gray-200" />
                            <p className="text-[16px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center">Your image here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 text-white text-3xl leading-none font-bold hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = lightboxImg; a.download = 'tattty.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
            className="absolute top-4 right-16 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
